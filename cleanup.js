import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

const DIRECTORIES_TO_REMOVE = [
  'public_old',
  '-p',
  'sqleditor/sqleditor'
];

const FILES_TO_REMOVE = [
  'rename.bat',
  'rename_components.bat',
  'rename-all.bat',
  'cleanup.bat',
  'filelist.txt'
];

async function cleanupProject() {
  console.log('Starting project cleanup...');
  
  // Remove unnecessary files
  for (const file of FILES_TO_REMOVE) {
    try {
      if (fs.existsSync(file)) {
        console.log(`Removing file: ${file}`);
        await unlink(file);
      }
    } catch (error) {
      console.error(`Error removing file ${file}:`, error);
    }
  }

  // Remove unnecessary directories
  for (const dir of DIRECTORIES_TO_REMOVE) {
    try {
      if (fs.existsSync(dir)) {
        console.log(`Removing directory: ${dir}`);
        await removeDirectory(dir);
      }
    } catch (error) {
      console.error(`Error removing directory ${dir}:`, error);
    }
  }

  // Fix root utils.js file if needed
  if (fs.existsSync('src/utils.js') && !fs.existsSync('src/utils.jsx')) {
    console.log('Renaming utils.js to utils.jsx');
    fs.renameSync('src/utils.js', 'src/utils.jsx');
  }

  console.log('Project cleanup completed successfully!');
}

async function removeDirectory(dirPath) {
  try {
    // Check if the directory exists
    if (!fs.existsSync(dirPath)) {
      return;
    }

    // On Windows, normal rmdir might not work with non-empty directories
    // Use rimraf-like behavior with recursive deletion
    if (process.platform === 'win32') {
      try {
        await execAsync(`rmdir /s /q "${dirPath}"`);
        return;
      } catch (error) {
        console.error(`Failed to use Windows rmdir command, falling back to manual deletion`);
      }
    }

    // Manual recursive deletion
    const entries = await readdir(dirPath);
    
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry);
      const entryStat = await stat(entryPath);
      
      if (entryStat.isDirectory()) {
        await removeDirectory(entryPath);
      } else {
        await unlink(entryPath);
      }
    }
    
    await rmdir(dirPath);
  } catch (error) {
    console.error(`Error removing directory ${dirPath}:`, error);
  }
}

cleanupProject().catch(console.error); 