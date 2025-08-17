@echo off
echo Committing visual and audio enhancements to Kiwi Farm game...

cd /d "C:\Game\Kiwi farm\kiwi_game-"

echo Adding all files to git...
git add .

echo Creating commit...
git commit -m "Add visual backgrounds and audio system

- Enhanced farm backgrounds with animated sky gradients
- Added dynamic weather effects (rain, sunshine, clouds, wind)
- Implemented rolling hills and parallax landscapes
- Created beautiful animated cattle sprites with movement
- Added comprehensive audio system with AudioManager
- Created asset directories for images and audio
- Enhanced CSS with farm-themed animations and effects
- Added menu animations with gentle bouncing
- Improved FarmRenderer with weather-reactive visuals
- Created audio setup system with free source documentation
- Added web-based audio generator for testing
- Implemented smooth transitions and hover effects
- Enhanced game canvas with natural farm scenery

🤖 Generated with Claude Code (https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo Pushing to remote repository...
git push origin master

echo Done! Changes committed and pushed successfully.
pause