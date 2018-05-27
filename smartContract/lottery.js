"use strict";

var LotteryItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.from = obj.from;
        this.issue = obj.issue;
        this.lottery = obj.lottery;
        this.dateStr = obj.dateStr;
        this.index = obj.index;
    } else {
        this.issue = "";
        this.lottery = "";
        this.from = "";
        this.dateStr = "";
        this.index = 0;
    }
};

LotteryItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var BlockLottery = function () {
    LocalContractStorage.defineMapProperty(this, "arrayMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};

BlockLottery.prototype = {
    init: function () {
        this.size = 0;
    },
    //下注
    betting: function (issue, lottery, dateStr) {
        issue = issue.trim();
        lottery = lottery.trim();
        var from = Blockchain.transaction.from;
        if (issue === "" || lottery === "") {
            throw new Error("empty issue / value");
        }
        if (issue.length > 64 || lottery.length > 1000) {
            throw new Error("value exceed limit length")
        }
        //用户+彩期 作为一条数据
        var key = from + issue;
        var lotteryItem = this.dataMap.get(from + issue);
        if (lotteryItem) {
            lotteryItem.lottery = lotteryItem.lottery + '|' + lottery;
        } else {
            lotteryItem = new LotteryItem();
            lotteryItem.issue = issue;
            lotteryItem.dateStr = dateStr;
            lotteryItem.index = this.size;
            lotteryItem.from = from;
            lotteryItem.lottery = lottery;
        }
        var index = this.size;
        this.arrayMap.set(index, key);
        this.dataMap.put(key, lotteryItem);
        this.size += 1;
    },
    bettingList: function (limit, offset) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        var number = offset + limit;
        if (number > this.size) {
            number = this.size;
        }
        var result = {
            data:[],
            totalCount:this.size
        };
        var rData = [];
        for (var i = offset; i < number; i++) {
            var key = this.arrayMap.get(i);
            var object = this.dataMap.get(key);
            rData.push(object);
        }
        result.data = rData;
        return result;
    }
};
module.exports = BlockLottery;