LTC Helper Test Script
- Behaves like a third party client to the helper app and infinitely executes random command using random input.

TODO
- Let user's to select behavior of this app
    Possible Options
    - Record mode (All <-> Error only) (Currently Error only)
    - Execute < > command < > times
    - Execute sequence of the command (User provides the sequence)
    - Execute random command infinite times (Current version)
    - Execute random command < > times
- Non Agent related command support
- Smart way of choosing next command in random mode (Using previous command's result?)

HOW TO RUN
Install VSCode version 1.5.3 (Latest) http://code.visualstudio.com/
Install NodeJs version 4.6.0 (Latest stable release) https://nodejs.org/en/

Open a command prompt 
Run 'npm install'
Open VSCode to this folder
Ctrl + Shift + B to build
F5 to run