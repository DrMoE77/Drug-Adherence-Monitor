var adh = Number
var dosesTaken = Number
var dosesPrescribed = Number
var dbi =Number

function adherance(){
  adh = dosesTaken*100/dosesPrescribed
  return adh
}
document.getElementById("adhresult").innerHTML = adherance()+"%"
// To do Adhderence vs Drug Burden Index