  console.log('Found files in logs:');
  for (const [cleanPath, info] of Object.entries(fileContents)) {
    let lowerPath = info.originalPath.toLowerCase().replace(/\\/g, '/');
    if (!lowerPath.includes('d:/ma website/')) {
      // Skip files outside project directory
      continue;
    }
    
    console.log(`- ${info.originalPath} (from tool ${info.tool})`);
    
    // Determine target output path inside /recovered
    let relPath = info.originalPath;
    if (relPath.toLowerCase().startsWith('d:\\ma website\\')) {
      relPath = relPath.substring('d:\\ma website\\'.length);
    } else if (relPath.toLowerCase().startsWith('d:/ma website/')) {
      relPath = relPath.substring('d:/ma website/'.length);
    }
    
    // Clean relative path of double backslashes
    relPath = relPath.replace(/^\\+/, '').replace(/^\/+/, '');
    
    const outPath = path.join(outputDir, relPath);
    const parentDir = path.dirname(outPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(outPath, info.content);
  }