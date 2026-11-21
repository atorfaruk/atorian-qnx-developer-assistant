
const path = require('path');

const MAX_FILES = 80;
const MAX_FILE_SIZE = 256 * 1024;
const MAX_TOTAL_SIZE = 2 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  '.c', '.h', '.cc', '.cpp', '.hpp',
  '.cxx', '.hxx', '.mk', '.txt', '.md', '.json'
]);

const BUILD_FILES = new Set([
  'makefile',
  'gnumakefile',
  'buildfile'
]);

const QNX_HEADERS = new Set([
  'sys/neutrino.h',
  'sys/dispatch.h',
  'sys/iofunc.h',
  'sys/resmgr.h',
  'sys/netmgr.h'
]);

const QNX_API_PATTERN =
  /\b(iofunc_[A-Za-z0-9_]*|resmgr_[A-Za-z0-9_]*|dispatch_[A-Za-z0-9_]*|ChannelCreate|ChannelDestroy|ConnectAttach|ConnectDetach|MsgSend|MsgReceive|MsgReply)\b/g;

function isSupportedFile(filePath) {
  const name = path.posix.basename(filePath).toLowerCase();
  const extension = path.posix.extname(name);

  return BUILD_FILES.has(name) ||
    name.endsWith('.build') ||
    ALLOWED_EXTENSIONS.has(extension);
}

function inspectProject(inputFiles) {
  if (!Array.isArray(inputFiles) || inputFiles.length === 0) {
    throw new Error('Please select a project containing supported files.');
  }

  if (inputFiles.length > MAX_FILES) {
    throw new Error(`Maximum ${MAX_FILES} files can be inspected at once.`);
  }

  let totalSize = 0;

  const inspectedFiles = [];
  const findings = [];
  const allIncludes = new Set();
  const languages = new Set();
  const qnxApis = new Set();
  const buildTools = new Set();
  const buildTargets = new Set();
  const buildSourceReferences = new Set();

  let sourceCount = 0;
  let headerCount = 0;
  let buildConfigCount = 0;
  let mainCount = 0;

  for (const file of inputFiles) {
    if (
      !file ||
      typeof file.path !== 'string' ||
      typeof file.content !== 'string'
    ) {
      continue;
    }

    const relativePath = file.path.replace(/\\/g, '/');

    if (
      relativePath.startsWith('/') ||
      /^[a-zA-Z]:/.test(relativePath) ||
      relativePath.split('/').includes('..')
    ) {
      findings.push({
        severity: 'warning',
        file: relativePath,
        line: null,
        message: 'Unsafe or invalid relative file path was skipped.'
      });
      continue;
    }

    const normalizedPath = path.posix.normalize(relativePath);

    if (!isSupportedFile(normalizedPath)) {
      continue;
    }

    const size = Buffer.byteLength(file.content, 'utf8');

    if (size > MAX_FILE_SIZE) {
      findings.push({
        severity: 'warning',
        file: normalizedPath,
        line: null,
        message: 'File skipped because it exceeds the 256 KB inspection limit.'
      });
      continue;
    }

    totalSize += size;

    if (totalSize > MAX_TOTAL_SIZE) {
      throw new Error(
        'Total project content exceeds the 2 MB inspection limit.'
      );
    }

    const name = path.posix.basename(normalizedPath).toLowerCase();
    const extension = path.posix.extname(name);
    const lines = file.content.split(/\r?\n/);

    inspectedFiles.push({
      path: normalizedPath,
      size,
      lines: lines.length
    });

    if (['.c', '.cc', '.cpp', '.cxx'].includes(extension)) {
      sourceCount++;
      languages.add('C/C++');
    }

    if (['.h', '.hpp', '.hxx'].includes(extension)) {
      headerCount++;
      languages.add('C/C++ headers');
    }

    const isBuildFile =
      BUILD_FILES.has(name) ||
      name.endsWith('.build') ||
      extension === '.mk';

    if (isBuildFile) {
      buildConfigCount++;
      languages.add('Build configuration');
    }

    let fileHasMain = false;

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Header include detection
      const includeMatch = line.match(
        /^\s*#\s*include\s*[<"]([^>"]+)[>"]/
      );

      if (includeMatch) {
        const header = includeMatch[1].replace(/\\/g, '/');
        allIncludes.add(header);

        if (QNX_HEADERS.has(header)) {
          findings.push({
            severity: 'info',
            file: normalizedPath,
            line: lineNumber,
            message: `QNX Neutrino header reference found: ${header}.`
          });
        }
      }

      // Possible C/C++ program entry point
      if (
        ['.c', '.cc', '.cpp', '.cxx'].includes(extension) &&
        !fileHasMain &&
        /\b(?:int|void)\s+main\s*\(/.test(line)
      ) {
        fileHasMain = true;
        mainCount++;

        findings.push({
          severity: 'info',
          file: normalizedPath,
          line: lineNumber,
          message: 'Possible main() entry point found.'
        });
      }

      // QNX API reference detection
      const apiMatches = line.match(QNX_API_PATTERN);

      if (apiMatches) {
        for (const api of apiMatches) {
          qnxApis.add(api);
        }

        findings.push({
          severity: 'info',
          file: normalizedPath,
          line: lineNumber,
          message: `Potential QNX API reference found: ${[...new Set(apiMatches)].join(', ')}.`
        });
      }

      // Build configuration analysis
      if (isBuildFile) {
        if (/\bqcc(?:\.exe)?\b/i.test(line)) {
          buildTools.add('qcc');

          findings.push({
            severity: 'info',
            file: normalizedPath,
            line: lineNumber,
            message: 'QNX qcc compiler command reference found.'
          });
        }

        if (/\bq\+\+(?:\.exe)?\b/i.test(line)) {
          buildTools.add('q++');

          findings.push({
            severity: 'info',
            file: normalizedPath,
            line: lineNumber,
            message: 'QNX q++ compiler command reference found.'
          });
        }

        if (/^\s*[A-Za-z0-9_.-]+\s*:/ .test(line) &&
            !/^\s*#/.test(line)) {
          const targetMatch = line.match(
            /^\s*([A-Za-z0-9_.-]+)\s*:/
          );

          if (targetMatch) {
            buildTargets.add(targetMatch[1]);
          }
        }

        const sourceMatches = line.match(
          /[A-Za-z0-9_./-]+\.(?:c|cc|cpp|cxx)\b/gi
        );

        if (sourceMatches) {
          for (const source of sourceMatches) {
            buildSourceReferences.add(source.replace(/\\/g, '/'));
          }
        }
      }
    });
  }

  if (inspectedFiles.length === 0) {
    throw new Error('No supported project files were available for inspection.');
  }

  if (sourceCount === 0) {
    findings.push({
      severity: 'warning',
      file: null,
      line: null,
      message: 'No supported C/C++ source files were found.'
    });
  }

  if (buildConfigCount === 0) {
    findings.push({
      severity: 'warning',
      file: null,
      line: null,
      message: 'No recognised Makefile or QNX build configuration file was found.'
    });
  }

  if (buildTools.size === 0 && buildConfigCount > 0) {
    findings.push({
      severity: 'warning',
      file: null,
      line: null,
      message: 'No qcc or q++ compiler command was detected in the inspected build configuration files.'
    });
  }

  return {
    success: true,
    engine: 'ATORIAN Project Inspector',
    inspectionType: 'Static source and configuration inspection',

    summary: {
      inspectedFiles: inspectedFiles.length,
      sourceFiles: sourceCount,
      headerFiles: headerCount,
      buildConfigurationFiles: buildConfigCount,
      possibleMainEntryPoints: mainCount,
      uniqueIncludes: allIncludes.size,
      totalBytes: totalSize
    },

    languages: [...languages],

    includes: [...allIncludes].sort(),

    buildAnalysis: {
      detectedCompilerCommands: [...buildTools].sort(),
      detectedTargets: [...buildTargets].sort(),
      referencedSourceFiles: [...buildSourceReferences].sort()
    },

    qnxAnalysis: {
      detectedApis: [...qnxApis].sort(),
      detectedQnxHeaders: [...allIncludes]
        .filter(header => QNX_HEADERS.has(header))
        .sort()
    },

    files: inspectedFiles,
    findings,

    limitations: [
      'This is a lightweight text-based inspection, not a full C/C++ compiler or parser.',
      'Entry points, compiler commands, build targets and API references are detected using heuristic text matching.',
      'Build source references are extracted from configuration text and are not verified against actual build dependencies.',
      'No code was executed, compiled or modified.',
      'Detected QNX headers, APIs or compiler commands do not prove that the project builds or runs on QNX.'
    ]
  };
}

module.exports = { inspectProject };
