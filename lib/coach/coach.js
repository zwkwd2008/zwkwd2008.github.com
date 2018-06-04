var dappAddress = "n1uQihZiqUkKw9DxtJfJguVGLnU3gRVy1qc";
var intervalQuery;
var serialNumber;
var NebPay;    //https://github.com/nebulasio/nebPay

var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));

new Vue({
    el: '#app',
    data: function () {
        return {
            activeName: 'first',
            coachList: [],
            currentPage: 1,
            loading2: false,
            loading2Text:'请在星云钱包完成操作',
            coach: {
                busType: '21座小巴车'
            },
            searchParam: {
                fromCity: "",
                toCity: "",
                user: ""
            },
            totalCount: 0,
            pageSize: 5,
            listLoading: true,
            rules: {
                fromCity: [
                    {required: true, message: '出发城市不能为空', trigger: 'blur'},
                    {min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur'}
                ],
                toCity: [
                    {required: true, message: '到达城市不能为空', trigger: 'blur'},
                    {min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur'}
                ],
                fromStation: [
                    {required: true, message: '出发站点不能为空', trigger: 'blur'},
                    {min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur'}
                ],
                toStation: [
                    {required: true, message: '到达站点不能为空', trigger: 'blur'},
                    {min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur'}
                ],
                fromTime: [
                    {required: true, message: '发车时间不能为空', trigger: 'blur'},
                ],
                busType: [
                    {required: true, message: '发车时间不能为空', trigger: 'blur'},
                ],
                driverMobile: [
                    {required: true, message: '联系方式不能为空', trigger: 'blur'},
                    {pattern: /^1[34578]\d{9}$/, message: '目前只支持中国大陆的手机号码'}
                ]
            }
        };
    },
    methods: {
        getCoachList() {
            var from = Account.NewAccount().getAddressString();

            if ((this.searchParam.fromCity != "" && this.searchParam.toCity == "") || (this.searchParam.fromCity == "" && this.searchParam.toCity != "")) {
                this.$message({
                    type: 'error',
                    showClose: true,
                    message: '根据线路搜索,必须同时输入出发城市和到达城市'
                });
                return;
            }
            this.listLoading = true;
            var value = "0";
            var nonce = "0"
            var gas_price = "1000000"
            var gas_limit = "200000"
            var callFunction = "list";
            var callArgs = [this.pageSize, ((this.currentPage - 1) * this.pageSize + 1), this.searchParam.fromCity, this.searchParam.toCity, this.searchParam.user];
            var contract = {
                "function": callFunction,
                "args": JSON.stringify(callArgs)
            }
            var self = this;
            neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
                let result = JSON.parse(resp.result);
                self.coachList = result.data;
                ;
                self.totalCount = result.totalCount;
                self.listLoading = false;
            }).catch(function (err) {
                console.log("error:" + err.message)
                self.listLoading = false;
            })
        },
        submitBlock() {
            var coach = this.coach;
            var self = this;
            NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
            nebPay = new NebPay();
            if (coach.fromCity == "" || coach.toCity == "" || coach.fromStation == "" || coach.toStation == "" || coach.fromTime == "" || coach.driverMobile == "" || coach.fromCity == null || coach.toCity == null || coach.fromStation == null || coach.toStation == null || coach.fromTime == null || coach.driverMobile == null) {
                self.$message({
                    type: 'error',
                    showClose: true,
                    message: '出发城市,出发站点,到达城市,到达站点,出发时间,联系方式不能为空'
                });
                return;
            }
            if (typeof(webExtensionWallet) === "undefined") {
                this.$message({
                    type: 'error',
                    showClose: true,
                    message: '请先安装webExtensionWallet插件'
                });
                return;
            }
            var args = [coach.fromCity, coach.toCity, coach.fromStation, coach.toStation, coach.fromTime, coach.plateNumber, coach.driverMobile, coach.driverName, coach.busType, new Date().toLocaleString()];
            var to = dappAddress;
            var value = "0";
            var callFunction = "addCoach"
            var callArgs = JSON.stringify(args);
            serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
                listener: this.cbPush        //设置listener, 处理交易返回信息
            });
            self.loading2 = true;
        },
        pushCoach() {
            this.activeName = 'second';
        },
        cancelPush() {
            this.activeName = 'first';
        },
        funcIntervalQuery(txhash) {
            var self = this;
            self.loading2Text="交易确认中,请耐心等待.."
            this.receiptTransaction(txhash).then(function (resp) {
                var respObject = resp;
                console.log(JSON.stringify(resp));
                if (respObject.status == 1) {
                    clearInterval(self.intervalQuery);
                    self.$message({
                        type: 'success',
                        showClose: true,
                        message: '交易确认成功'
                    });
                    self.coach = {busType: '21座小巴车'};
                    self.activeName = 'first';
                    self.loading2 = false;
                    self.getCoachList();
                } else if (respObject.status == 0) {
                    clearInterval(self.intervalQuery);
                    self.$message({
                        type: 'error',
                        showClose: true,
                        message: '提交失败,请重试.hash=' + txhash
                    });
                    self.loading2 = false;
                }
            }).catch(function (err) {
                clearInterval(self.intervalQuery);
                self.loading2 = false;
                self.$message({
                    type: 'error',
                    showClose: true,
                    message: '提交失败,请重试' + err + ' ;hash=' + txhash
                });
            })
        },
        // 查询交易结果
        receiptTransaction(txhash) {
            var promise = new Promise(function (resolve, reject) {
                neb.api.getTransactionReceipt(txhash).then(function (resp) {
                    resolve(resp);
                }).catch(function (err) {
                    console.log(err);
                });
            });
            return promise
        },
        handleClick(tab, event) {
            console.log(tab, event);
        },
        handleSizeChange(val) {
            this.pageSize = val;
            this.getCoachList();
        },
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getCoachList();
        },
        cbPush(resp) {
            var self = this;
            if (!resp.txhash) {
                self.loading2 = false;
                self.$message({
                    type: 'error',
                    showClose: true,
                    message: '提交失败,原因' + JSON.stringify(resp)
                });
                return;
            }
            self.intervalQuery = setInterval(function () {
                self.funcIntervalQuery(resp.txhash);
            }, 3000);
            console.log("response of push: " + JSON.stringify(resp))
        }
    },
    mounted: function () {
        this.getCoachList();
    }
})