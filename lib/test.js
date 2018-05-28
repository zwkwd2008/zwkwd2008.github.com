var d1 = new Date('2018/05/27 19:01:00');
var d2 = new Date();
var days = Math.floor((d2.getTime() - d1.getTime()) / (24 * 3600 * 1000));
var issue = 18061 + Math.floor(days / 7) * 3;
var days1 = days % 7;
if (days1 >= 4) {
    issue = issue + 2;
} else if (days1 >= 2) {
    issue = issue + 1;
}
console.log(issue)


