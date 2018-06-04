"use strict";

var CoachItem = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.from = obj.from;
        this.fromCity = obj.fromCity;
        this.toCity = obj.toCity;
        this.fromTime = obj.fromTime;
        this.plateNumber = obj.plateNumber;
        this.driverMobile = obj.driverMobile;
        this.fromStation = obj.fromStation;
        this.toStation = obj.toStation;
        this.dateStr = obj.dateStr;
        this.busType = obj.busType;
        this.driverName=obj.driverName;
    } else {
        this.from = "";
        this.fromCity = "";
        this.toCity = "";
        this.fromTime = "";
        this.plateNumber = "";
        this.driverMobile = "";
        this.fromStation = "";
        this.toStation = "";
        this.dateStr = "";
        this.driverName="";
        this.busType="21座中巴"
    }
};

CoachItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var BlockCoach = function () {
    LocalContractStorage.defineMapProperty(this, "userIndexMap");
    LocalContractStorage.defineMapProperty(this, "lineIndexMap");
    LocalContractStorage.defineMapProperty(this, "dataMap");
    LocalContractStorage.defineProperty(this, "size");
};

BlockCoach.prototype = {
    init: function () {
        this.size = 0;
    },

    addCoach: function (fromCity,toCity,fromStation,toStation,fromTime,plateNumber,driverMobile,driverName,busType,dataStr) {
        var coach = new CoachItem();
        coach.fromCity=fromCity;
        coach.toCity=toCity;
        coach.fromStation=fromStation;
        coach.toStation=toStation;
        coach.fromTime=fromTime;
        coach.driverName = driverName;
        coach.busType = busType;
        coach.plateNumber=plateNumber;
        coach.driverMobile = driverMobile;
        coach.dateStr = dataStr;
        if (coach.fromCity === "" || coach.toCity === "" || coach.fromStation === "" || coach.toStation === "" || coach.fromTime === "" || coach.driverMobile === "") {
            throw new Error("param err");
        }
        var from = Blockchain.transaction.from;
        coach.from = from;
        var line = coach.fromCity + coach.toCity;
        // valid exist
        var lineIndexList = this.lineIndexMap.get(line);
        if (lineIndexList) {
            var duplicate = this._buildDuplicateKey(coach);
            for (var itemIndex in lineIndexList) {
                var existCoach = this.dataMap.get(itemIndex);
                var existKey = this._buildDuplicateKey(existCoach);
                if (duplicate === existKey) {
                    throw new Error(" add fail : line exist ");
                }
            }
        } else {
            lineIndexList = [];
        }
        var index = this.size;
        this.dataMap.put(index, coach);
        lineIndexList.push(index);
        this.lineIndexMap.put(line, lineIndexList);
        // user index
        var userIndexList = this.userIndexMap.get(from);
        if (!userIndexList) {
            userIndexList = [];
        }
        userIndexList.push(index);
        this.userIndexMap.put(from, userIndexList);
        this.size += 1;
    },
    list: function (limit, offset, fromCity, toCity, user) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if (offset > this.size) {
            throw new Error("offset is not valid");
        }
        if (user != "") {
            return this._userList(user, limit, offset);
        }
        if (fromCity != "" && toCity != "") {
            return this._lineList(fromCity, toCity, limit, offset);
        }
        var number = this.size - offset - limit;
        var start = this.size - offset;
        if (number < 0) {
            number = -1;
        }
        var result = {
            data: [],
            totalCount: this.size
        };
        var rData = [];
        for (var i = start; i > number; i--) {
            var object = this.dataMap.get(i);
            if (object)
            {
                rData.push(object);
            }
        }
        result.data = rData;
        return result;
    },
    _lineList: function (fromCity, toCity, limit, offset) {
        var result = {
            data: [],
            totalCount: 0
        };
        var line = fromCity + toCity;
        var lineIndexList = this.lineIndexMap.get(line);
        if (!lineIndexList) {
            return result;
        }
        var indexSize = lineIndexList.length;
        var number = indexSize - offset - limit;
        var start = indexSize - offset;
        if (number < 0) {
            number = -1;
        }
        var rData = [];
        for (var i = start; i > number; i--) {
            var userIndex = lineIndexList[i];
            var object = this.dataMap.get(userIndex);
            if (object)
            {
                rData.push(object);
            }
        }
        result.data = rData;
        result.totalCount = indexSize;
        return result;
    },
    _userList: function (user, limit, offset) {
        var result = {
            data: [],
            totalCount: 0
        };
        var userIndexList = this.userIndexMap.get(user);
        if (!userIndexList) {
            return result;
        }
        var indexSize = userIndexList.length;
        var number = indexSize - offset - limit;
        var start = indexSize - offset;
        if (number < 0) {
            number = -1;
        }
        var rData = [];
        for (var i = start; i > number; i--) {
            var userIndex = userIndexList[i];
            var object = this.dataMap.get(userIndex);
            if (object)
            {
                rData.push(object);
            }
        }
        result.data = rData;
        result.totalCount = indexSize;
        return result;
    },
    _buildDuplicateKey: function (coach) {
        return coach.fromCity + coach.toCity + coach.fromStation + coach.toStation + coach.fromTime;
    }
};
module.exports = BlockCoach;