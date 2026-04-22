const fs = require('fs');
const filePath = 'd:/mafynGate/frontend/app/messages/page.js';
let content = fs.readFileSync(filePath, 'utf8');

// The standard replacement failed, probably due to whitespace in the button block.
// Let's use a regex to find the specific window.open call in the gallery context.

const regex = /onClick=\{\(\) => window\.open\(getMediaUrl\(d\.fileUrl\), '_blank'\)\}/g;
const newContent = content.replace(regex, "onClick={() => downloadMedia(d.fileUrl)}");

if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('SUCCESS: Updated gallery download button in messages page.');
} else {
    console.error('FAILED: Could not find the window.open call in messages page.');
    process.exit(1);
}
