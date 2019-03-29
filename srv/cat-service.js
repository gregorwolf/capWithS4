/*eslint no-console: 0, no-unused-vars: 0, no-undef:0, no-process-exit:0*/
/*eslint-env node, es6 */
"use strict";
/**
 * Implementation for CatalogService defined in ./cat-service.cds
 */

const cds = require("@sap/cds");

module.exports = (srv) => {

	const {
		PO
	} = cds.entities("opensap.PurchaseOrder");

// If you want to use API Hub instead of local proxy uncomment the withCustomHeaders, fill in your API key and then use the sandbox.api.sap.com URl
	srv.on("READ", "BusinessPartners", async(req) => {
		var bp = require("@sap/cloud-sdk-vdm-business-partner-service");
		let businessPartners = await bp.BusinessPartner.requestBuilder()
			.getAll()
			.top(100)
		//	.withCustomHeaders({apikey: "<your api key here>"})
			.execute({
				url: "https://qgyx1mabatjzydhfs4mock-s4mocknode.hanapm.local.com:30033/"
			//	url: "https://sandbox.api.sap.com/s4hanacloud/"
			});
		let data = [];
		for (let each of businessPartners) {
			data.push({
				"BusinessPartner": each.businessPartner,
				"Category": each.businessPartnerCategory,
				"FullName": each.businessPartnerFullName,
				"UUID": each.businessPartnerUuid,
				"Grouping": each.businessPartnerGrouping
			});
		}
		req.reply(data);
	});

	srv.after("READ", "POs", async(entities, req) => {
		console.log(`Data: ${JSON.stringify(req.query)}`);
		for (let each of entities) {
			var bp = require("@sap/cloud-sdk-vdm-business-partner-service");
			let businessPartner = await bp.BusinessPartner.requestBuilder()
				.getByKey(each.PARTNERS_BusinessPartner)
				.execute({
					url: "https://qgyx1mabatjzydhfs4mock-s4mocknode.hanapm.local.com:30033/"
				});
			each.PARTNERS= {
				"BusinessPartner": businessPartner.businessPartner,
				"Category": businessPartner.businessPartnerCategory,
				"FullName": businessPartner.businessPartnerFullName,
				"UUID": businessPartner.businessPartnerUuid,
				"Grouping": businessPartner.businessPartnerGrouping
			}; 
		}
	});
};