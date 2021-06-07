sap.ui.define([
    'sap/ui/core/mvc/Controller',
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function(Controller, MessageBox, MessageToast, JSONModel) {
    'use strict';
    return Controller.extend("emc.hr.payroll.controller.Add",{
        onInit: function(){
            this.oModel = new JSONModel();
            this.oModel.setData({
                "productData": {
                    "PRODUCT_ID" : "",
                    "TYPE_CODE" : "PR",
                    "CATEGORY" : "Notebooks",
                    "NAME" : "<enter name>",
                    "DESCRIPTION" : "<Enter Desc.>",
                    "SUPPLIER_ID" : "0100000051",
                    "SUPPLIER_NAME" : "TECUM",
                    "TAX_TARIF_CODE" : "1 ",
                    "PRICE" : "0",
                    "CURRENCY_CODE" : "USD",
                    "DIM_UNIT" : "CM",
                    "To_Orders": []
                }                
            });
            this.getView().setModel(this.oModel, "viewModel");
        },
        onClear: function(){
            var payload = this.oModel.getProperty("/productData");
            payload.PRODUCT_ID = "";
            payload.SUPPLIER_ID = "";
            payload.PRICE = "";
            payload.CURRENCY_CODE = "USD";
            payload.NAME = "";
            payload.DESCRIPTION = "";
            this.oModel.setProperty("/productData", payload);
        },
        onEnter: function(oEvent){
            //https://www.youtube.com/watch?v=RMsTYQe_3Jg
            var that = this;
            //Step 1: Read the product ID from screen
            var sText = oEvent.getSource().getValue();
            //Step 2: Get the odata model object
            var oDataModel = this.getView().getModel();
            //Step 3: Fire the read call
            oDataModel.read("/ProductSet('" + sText + "')", {
                //Step 4: Handle success - set data to our local model
                urlParameters: {
                    "$expand": "To_Orders"
                },
                success: function(data){
                    that.oModel.setProperty("/productData", data);
                    that.oModel.setProperty("/productData/To_Orders", data.To_Orders.results);
                    //that.getView().byId("table0").setEntitySet("viewModel>/productData/To_Orders");
                },
                //Step 5: Error handling
                error: function(oError){
                    MessageBox.error(JSON.parse(oError.responseText).error.innererror.errordetails[0].message);
                }
            });
            
        },
        onMostExp: function(){
            //Step 1: Get the odata model object
            var that = this;
            var oDataModel = this.getView().getModel();
            //Step 2: Send the call function
            oDataModel.callFunction("/GetMostExpensiveProduct",{
                urlParameters: {
                    "I_CATEGORY" : "Servers"
                },
                success: function(data){
                    //Step 3: Success Response set data on screen by local model
                    that.oModel.setProperty("/productData", data);
                }
            });
            
        },
        onDelete: function(oEvent){
            //for update call oDataModel.update("/Entity", payload)

            var oDataModel = this.getView().getModel();
            oDataModel.remove("/ProductSet('" + this.getView().byId("name").getValue() + "')",{
                success: function(){
                    MessageToast.show("Product is now deleted");
                }
            });

        },
        onSave: function(){
            //MessageBox.confirm("This functionality is under construction");
            //Step 1: Prepare the payload
            var payload = this.oModel.getProperty("/productData");
            //Step 2: Get the odata model object to communicate with BE
            var oDataModel = this.getView().getModel();
            //Step 3: Fire the POST call on EntitySet with Payload
            oDataModel.create("/ProductSet", payload,{
                //call back for positive response
                success: function(data){
                    MessageToast.show("The product was created successfully!");
                },
                //call back for negative response
                error: function(oError){
                    MessageBox.error("An internal Error occurred");
                }
            });

        }
    });
});