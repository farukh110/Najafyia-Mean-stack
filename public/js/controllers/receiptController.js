(function () {
    angular.module('mainApp').controller('receiptController', ReceiptController);

    function ReceiptController($scope, $location, receiptService, $filter, $state, fileUpload, multipartForm, donationService, $translate) {
        vm = this;
        $scope.getAllReceipts = function (type) {
            receiptService.getReceiptDetails().then(function (res) {
                $scope.receiptDetails = res.data;
                if (type == "Khums") {
                    $scope.getKhumsReceiptsDetails();
                } else {
                    $scope.getReceiptsExceptKhums();
                }
            });
        }
        $scope.viewReceipt = function (invoiceNo) {
            $scope.receiptsDetails = $filter('filter')($scope.receiptDetails, { 'invoiceNo': invoiceNo })[0];
        }
        $scope.getKhumsReceiptsDetails = function () {

            $scope.filteredRecpByName = [];
            angular.forEach($scope.receiptDetails, function (donation) {
                var trimDonationDetail = [];
                recordDate = new Date(donation.created);
                donation.created = recordDate;
                // donation.created = `${recordDate.getDate()}-${recordDate.getMonth() + 1}-${recordDate.getFullYear()}`;
                angular.forEach(donation.donationdetails, function (donationDetails) {
                    if (donationDetails.program && donationDetails.program.length && donationDetails.program[0].programName && (donationDetails.program[0].programName.toLowerCase() == 'khums' || donationDetails.program[0].programName == 'الخمس')) {
                        trimDonationDetail.push(donationDetails)
                    }
                });
                donation.donationdetails = trimDonationDetail;
                if (trimDonationDetail.length > 0) {
                    $scope.filteredRecpByName.push(donation);
                }
            });
            $scope.filteredRecpByName.map((obj) => {
                if (obj.donationdetails && obj.donationdetails.length) {
                    let totalInUSD = obj.donationdetails.filter(obj => obj.donation.currency == '$');
                    let totalInEUR = obj.donationdetails.filter(obj => obj.donation.currency == '€');
                    let totalInGBP = obj.donationdetails.filter(obj => obj.donation.currency == '£');
                    obj.totalInUSD = total(totalInUSD)
                    obj.totalInEUR = total(totalInEUR)
                    obj.totalInGBP = total(totalInGBP)
                    return obj
                }
            })
            $scope.receiptDetails = $scope.filteredRecpByName;
        }
        $scope.getReceiptsExceptKhums = function () {

            $scope.filteredRecpByName = [];
            angular.forEach($scope.receiptDetails, function (donation) {
                var trimDonationDetail = [];
                recordDate = new Date(donation.created);
                donation.created = recordDate;
                // donation.created = `${recordDate.getDate()}.${recordDate.getMonth() + 1}.${recordDate.getFullYear()}`;
                angular.forEach(donation.donationdetails, function (donationDetails) {
                    if (donationDetails.program && donationDetails.program.length && donationDetails.program[0].programName && donationDetails.program[0].programName.toLowerCase() != 'khums' && donationDetails.program[0].programName != 'الخمس') {
                        trimDonationDetail.push(donationDetails)
                    }
                });
                donation.donationdetails = trimDonationDetail;
                if (trimDonationDetail.length > 0) {
                    $scope.filteredRecpByName.push(donation);
                }
            });
            $scope.filteredRecpByName.map((obj) => {
                if (obj.donationdetails && obj.donationdetails.length) {
                    let totalInUSD = obj.donationdetails.filter(obj => obj.donation.currency == '$');
                    let totalInEUR = obj.donationdetails.filter(obj => obj.donation.currency == '€');
                    let totalInGBP = obj.donationdetails.filter(obj => obj.donation.currency == '£');
                    obj.totalInUSD = total(totalInUSD)
                    obj.totalInEUR = total(totalInEUR)
                    obj.totalInGBP = total(totalInGBP)
                    return obj
                }
            })
            $scope.receiptDetails = $scope.filteredRecpByName;
        }
        function total(array) {
            return array.reduce((total, num) => {
                return Number(total) + Number(num.amount || num.totalAmount);
            }, 0)
        }
        $scope.printReceipt = function (path) {
            let w;
            if (path.indexOf('/') >= 0) {
                w = window.open(path.split('/').slice(1).join('/'));
            } else {
                w = window.open(path.split('\\').slice(1).join('/'));
            }
            w.print();
        }

        $scope.sendReceiptEmail = function (selectedDonation, type) {
            let obj = {
                path: (type == 'khums') ? selectedDonation.documentPathKhums : selectedDonation.documentPath,
                donorEmail: selectedDonation.donor[0].email,
                donorName: selectedDonation.donor[0].donarName,
                receiptType: type,
                // userLang: selectedDonation.donor["0"].user["0"].language
            }
            receiptService.sendReceipt(obj)
                .then(function (res) {
                    if (res && res.status == 200) {
                        let message = (type == 'khums') ? $translate.instant("Khums Receipt Successfully Sent") : $translate.instant("Receipt Successfully Sent");
                        swal(
                            $translate.instant("Success!"),
                            message,
                            "success");
                        let elem = document.getElementById('viewReceiptModal');
                        elem.children['0'].children['0'].children['0'].children['0'].click();
                    }
                });
        }
        $scope.sendReceiptEmailandUpdateDoc = function (path, selectedDonation) {
            let obj = {
                path: path,
                donationId: selectedDonation._id,
                donorEmail: selectedDonation.donor[0].email,
                donorName: selectedDonation.donor[0].donarName,
                // userLang: selectedDonation.donor["0"].user["0"].language
            }
            donationService.updateDonationWithDocument(obj).then((res) => {
                if (res && res.status == 200) {
                    swal(
                        "Success",
                        "Khums Receipt Successfully Sent",
                        "success");
                    location.reload();

                }
                let elem = document.getElementById('viewReceiptModal');
                elem.children['0'].children['0'].children['0'].children['0'].click();

            })
        }
        $scope.uploadDocument = function (file, selectedDonation) {
            if (!file) {
                swal({
                    title: 'No file Found',
                    position: 'center-center',
                    type: 'error'
                })
                return
            };
            donationService.uploadAndSendFile(file).then((res) => {
                if (res && res.status == 200) {
                    $scope.sendReceiptEmailandUpdateDoc(res.data.path, selectedDonation);
                    let index = $scope.receiptDetails.findIndex(obj => obj.invoiceNo == selectedDonation.invoiceNo);
                    let obj = $scope.receiptDetails.find(obj => obj.invoiceNo == selectedDonation.invoiceNo);
                    obj.isKhums = true;
                    obj.documentPath = res.data.path;
                    if (index >= 0) {
                        $scope.receiptDetails.splice(index, 1, obj)
                    }
                }
            })
        };
    }
})();