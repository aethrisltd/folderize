const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'folderize',
  version: '1.8.0',
  rebuildConfig: {},
  hooks: {
    postPackage: async (forgeConfig, options) => {
      console.info('postPackage() Packages built at:', options.outputPaths);
      if (!(options.outputPaths instanceof Array)) {
        return;
      }
      let packageDotJson = "";
      if (process.platform === 'darwin') {
        packageDotJson = path.join(options.outputPaths[0], 'folderize.app', 'Contents', 'Resources', 'app', 'package.json');
      } 
      else if (process.platform === 'win32') {
        packageDotJson = path.join(options.outputPaths[0], 'resources', 'app', 'package.json');
      }
      else if (process.platform === 'linux') {
        packageDotJson = path.join(options.outputPaths[0], 'resources', 'app', 'package.json');
      }

      const content = fs.readFileSync(packageDotJson);
      const json = JSON.parse(content.toString());
      Object.keys(json).forEach((key) => {
        switch (key) {
          case 'name': {
            break;
          }
          case 'version': {
            break;
          }
          case 'main': {
            break;
          }
          case 'author': {
            break;
          }
          case 'description': {
            break;
          }
          case 'license': {
            break;
          }
          default: {
            delete json[key];
            break;
          }
        }
      });
      fs.writeFileSync(packageDotJson, JSON.stringify(json, null, '\t'));
    },
  },
  packagerConfig: {
    asar: false,
    icon: './src/icons/icon'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupIcon: "./src/icons/icon.ico",
      },
    },
    {
      name: '@electron-forge/maker-zip',
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          icon: './src/icons/icon.png',
        },
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO',
        icon: './src/icons/icon.icns',
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          icon: './src/icons/icon.png',
        },
      },
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'aethrisltd',
          name: 'folderize',
          token: process.env.GITHUB_TOKEN,
        },
      }
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/html/main_window.html',
              js: './src/scripts/main_window.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
            {
              html: './src/html/tray_window.html',
              js: './src/scripts/tray_window.js',
              name: 'tray_window',
              preload: {
                js: './src/preload.js',
              },
            },
            {
              html: './src/html/log_window.html',
              js: './src/scripts/log_window.js',
              name: 'log_window',
              preload: {
                js: './src/preload.js',
              },
            },
          ],
        },
      },
    },
  ],
};
