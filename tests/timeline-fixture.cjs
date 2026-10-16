/* Existing visual fixtures use approved scene coordinates, not scroll distance. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const scope={window:{}};vm.createContext(scope);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../prototype/timeline.js'),'utf8'),scope);
module.exports={clock:scope.window.NF_TIMELINE,toScroll:scope.window.NF_TIMELINE.fromScene};
