const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Replace instances of "/api/..." with API_BASE + "/api/..."
            if (content.includes('"/api/')) {
                content = content.replace(/"\/api\//g, 'API_BASE + "/api/');
            }
            
            // Fix files that define their own apiBase
            if (content.includes('const getApiBase = ()')) {
                content = content.replace(/const getApiBase = \(\): string => {[\s\S]*?};/, '');
                content = content.replace(/getApiBase\(\)/g, 'API_BASE');
            }
            if (content.includes('const envApiBase = import.meta.env.VITE_API_BASE_URL')) {
                // Remove local apiBase definitions
                content = content.replace(/const envApiBase = import\.meta\.env\.VITE_API_BASE_URL \|\| "";\s*const apiBase = envApiBase[^;]+;/g, '');
                content = content.replace(/apiBase/g, 'API_BASE');
            }

            if (content !== originalContent && !content.includes('import API_BASE')) {
                // Add import to top
                content = `import API_BASE from "@/lib/apiBase";\n` + content;
            }
            
            fs.writeFileSync(fullPath, content);
        }
    }
}

processDir(srcDir);
console.log('Fixed API routes');
