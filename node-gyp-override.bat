for /f "delims=" %P in ('npm prefix -g') do npm config set node_gyp "%P\node_modules\node-gyp\bin\node-gyp.js"