const fs = require('fs');

const content = fs.readFileSync('overview_log.json', 'utf16le');
const lines = content.split('\n');

for (let line of lines) {
  try {
    // skip BOM if present
    if (line.charCodeAt(0) === 0xFEFF) {
      line = line.substring(1);
    }
    const j = JSON.parse(line);
    if (j.tool_calls) {
      for (let t of j.tool_calls) {
        if (t.name.includes('write_to_file') && t.args.TargetFile && t.args.TargetFile.endsWith('Overview.jsx')) {
          fs.writeFileSync('src/components/Overview.jsx', t.args.CodeContent);
          console.log('Restored original Overview.jsx');
          process.exit(0);
        }
      }
    }
  } catch (e) {
  }
}
