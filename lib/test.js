var st = [1];
var size = st.length;

var offset = 1;
var limit = 5;
    if (offset > size) {
        throw new Error("offset is not valid");
    }
    var number = size-offset - limit;
    var start = size-offset;
    if (number < 0) {
        number = -1;
    }
    var rData = [];
    for (var i = start; i > number; i--) {
        rData.push(st[i]);
    }

    console.log(rData)


