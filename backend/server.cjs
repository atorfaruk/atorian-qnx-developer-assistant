
const http = require('http');
const fs = require('fs');
const path = require('path');
const { inspectProject } = require('./project-inspector.cjs');
const QNX_BASE =
  process.env.QNX_BASE || 'C:\\Users\\Uspakie\\qnx800';

function parseBuildLog(log) {
  const diagnostics = [];

  for (const line of log.split(/\r?\n/)) {
    let match;

    match = line.match(
      /^(.+):(\d+):(\d+):\s*(fatal error|error|warning|note):\s*(.*)$/i
    );

    if (match) {
      diagnostics.push({
        file: match[1],
        line: Number(match[2]),
        column: Number(match[3]),
        severity: match[4].toLowerCase(),
        message: match[5],
        format: 'gcc-qcc'
      });
      continue;
    }

    match = line.match(
      /^(.+):(\d+):\s*(fatal error|error|warning|note):\s*(.*)$/i
    );

    if (match) {
      diagnostics.push({
        file: match[1],
        line: Number(match[2]),
        column: null,
        severity: match[3].toLowerCase(),
        message: match[4],
        format: 'gcc-qcc'
      });
      continue;
    }

    match = line.match(
      /^(.+)\((\d+),(\d+)\):\s*(fatal error|error|warning|note)\s*(?:[A-Z]+\d+)?\s*:\s*(.*)$/i
    );

    if (match) {
      diagnostics.push({
        file: match[1],
        line: Number(match[2]),
        column: Number(match[3]),
        severity: match[4].toLowerCase(),
        message: match[5],
        format: 'msvc-style'
      });
      continue;
    }

    if (/undefined reference to|cannot find -l|cannot find library|undefined symbol/i.test(line)) {
      diagnostics.push({
        file: null,
        line: null,
        column: null,
        severity: 'error',
        message: line.trim(),
        format: 'linker'
      });
      continue;
    }

    if (/make(?:\.exe)?: \*\*\*/i.test(line)) {
      diagnostics.push({
        file: null,
        line: null,
        column: null,
        severity: 'error',
        message: line.trim(),
        format: 'make'
      });
    }
  }

  const errors = diagnostics.filter(
    item => item.severity === 'error' || item.severity === 'fatal error'
  );

  const warnings = diagnostics.filter(
    item => item.severity === 'warning'
  );

  const notes = diagnostics.filter(
    item => item.severity === 'note'
  );

  const suggestions = [];

  for (const item of diagnostics) {
    const message = item.message.toLowerCase();
    let suggestion = null;

    if (message.includes('implicit declaration of function') || message.includes('not declared')) {
      suggestion = 'Check the function declaration, required header and spelling.';
    } else if (message.includes('no such file or directory') || message.includes('cannot find')) {
      suggestion = 'Check whether the referenced file or library exists and whether its search path is correct.';
    } else if (message.includes('undefined reference') || message.includes('undefined symbol')) {
      suggestion = 'Check whether the symbol is implemented and whether its object file or library is included in the link.';
    } else if (message.includes('unused variable')) {
      suggestion = 'Check whether the variable is needed. Remove it if unnecessary or use it appropriately.';
    } else if (message.includes('multiple definition')) {
      suggestion = 'Check whether the same symbol is defined in more than one source or object file.';
    } else if (/make(?:\.exe)?: \*\*\*/i.test(message)) {
      suggestion = 'Inspect preceding compiler or linker diagnostics. This make error may be a consequence of an earlier failure.';
    }

    if (suggestion) {
      suggestions.push({
        diagnostic: item.message,
        suggestion
      });
    }
  }

  return {
    success: true,
    summary: {
      total: diagnostics.length,
      errors: errors.length,
      warnings: warnings.length,
      notes: notes.length
    },
    diagnostics,
    suggestions,
    parser: 'ATORIAN extended local diagnostic parser',
    limitation: 'Recognised diagnostic patterns are extracted. Suggestions are general checks, not verified fixes. Unrecognised output may be missed.'
  };
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://127.0.0.1:3001');

  if (url.pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'online',
      application: 'ATORIAN QNX Developer Assistant',
      message: 'Local backend is working'
    }));
    return;
  }

  if (url.pathname === '/api/environment' && req.method === 'GET') {
    const qccPath = path.join(
      QNX_BASE, 'host', 'win64', 'x86_64', 'usr', 'bin', 'qcc.exe'
    );

    const targetPath = path.join(QNX_BASE, 'target', 'qnx');
    const environmentScript = path.join(QNX_BASE, 'qnxsdp-env.bat');

    res.writeHead(200);
    res.end(JSON.stringify({
      installation: {
        detected: fs.existsSync(QNX_BASE),
        path: QNX_BASE
      },
      compiler: {
        detected: fs.existsSync(qccPath),
        path: qccPath
      },
      target: {
        detected: fs.existsSync(targetPath),
        path: targetPath
      },
      environmentScript: {
        detected: fs.existsSync(environmentScript),
        path: environmentScript
      },
      note: 'Checks installation files only. It does not execute the compiler or connect to a QNX target.'
    }));
    return;
  }

  if (url.pathname === '/api/analyze-log' && req.method === 'POST') {
    let body = '';
    let tooLarge = false;

    req.on('data', chunk => {
      body += chunk.toString();

      if (Buffer.byteLength(body, 'utf8') > 1024 * 1024) {
        tooLarge = true;
        res.writeHead(413);
        res.end(JSON.stringify({
          error: 'Log is too large. Maximum size is 1 MB.'
        }));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (tooLarge) return;

      try {
        const payload = JSON.parse(body);
        const log = payload.log;

        if (typeof log !== 'string' || !log.trim()) {
          res.writeHead(400);
          res.end(JSON.stringify({
            error: 'Please provide non-empty build log text.'
          }));
          return;
        }

        const result = parseBuildLog(log);

        res.writeHead(200);
        res.end(JSON.stringify(result));
      } catch {
        if (!res.headersSent) {
          res.writeHead(400);
          res.end(JSON.stringify({
            error: 'Invalid JSON request.'
          }));
        }
      }
    });

    return;
  }

  if (url.pathname === '/api/project/inspect' && req.method === 'POST') {
    let body = '';
    let tooLarge = false;

    req.on('data', chunk => {
      if (tooLarge) return;

      body += chunk.toString();

      if (Buffer.byteLength(body, 'utf8') > 2.5 * 1024 * 1024) {
        tooLarge = true;
        res.writeHead(413);
        res.end(JSON.stringify({
          error: 'Project upload exceeds the 2.5 MB request limit.'
        }));
      }
    });

    req.on('end', () => {
      if (tooLarge) return;

      try {
        const payload = JSON.parse(body);

        if (!Array.isArray(payload.files)) {
          res.writeHead(400);
          res.end(JSON.stringify({
            error: 'Request must contain a files array.'
          }));
          return;
        }

        const result = inspectProject(payload.files);

        res.writeHead(200);
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          error: error.message || 'Project inspection failed.'
        }));
      }
    });

    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(3001, '127.0.0.1', () => {
  console.log('ATORIAN backend running at http://127.0.0.1:3001');
});
