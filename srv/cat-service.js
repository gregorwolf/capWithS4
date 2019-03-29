/*eslint no-console: 0, no-unused-vars: 0, no-undef:0, no-process-exit:0*/
/*eslint-env node, es6 */
"use strict";
/**
 * Implementation for CatalogService defined in ./cat-service.cds
 */

module.exports = (srv) => {

	function getSafe(fn, defaultVal) {
		try {
			return fn();
		} catch (e) {
			return defaultVal;
		}
	}

	const cds = require("@sap/cds");
	const xsenv = require("@sap/xsenv");
	const services = xsenv.readCFServices();
	const s4 = getSafe(() => services.s4_sdk_backend);
	const apiKey = getSafe(() => s4.credentials.apiKey, "");
	const s4Url = getSafe(() => s4.credentials.url, "http://dummy.com");
	const {
		PO
	} = cds.entities("opensap.PurchaseOrder");

	srv.on("READ", "BusinessPartners", async(req) => {
		try {
			console.log(`Data: ${JSON.stringify(req.query)}`);
			const top = getSafe(() => req.query.SELECT.limit.rows.val, 100);
			const skip = getSafe(() => req.query.SELECT.limit.offset.val, 0);
			var bp = require("@sap/cloud-sdk-vdm-business-partner-service");
			let businessPartners = await bp.BusinessPartner.requestBuilder()
				.getAll()
				.top(top)
				.skip(skip)
				.withCustomHeaders({
					apikey: apiKey
				})
				.execute({
					url: s4Url
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
		} catch (err) {
			console.error(err.toString());
		}
	});

	srv.after("READ", "POs", async(entities, req) => {
		console.log(`Data: ${JSON.stringify(req.query)}`);
		for (let each of entities) {
			const bp = require("@sap/cloud-sdk-vdm-business-partner-service");
			try {
				let businessPartner = await bp.BusinessPartner.requestBuilder()
					.getByKey(each.PARTNERS_BusinessPartner)
					.withCustomHeaders({
						apikey: apiKey
					})
					.execute({
						url: s4Url
					});
				each.PARTNERS = {
					"BusinessPartner": businessPartner.businessPartner,
					"Category": businessPartner.businessPartnerCategory,
					"FullName": businessPartner.businessPartnerFullName,
					"UUID": businessPartner.businessPartnerUuid,
					"Grouping": businessPartner.businessPartnerGrouping
				};
			} catch (err) {
				console.error(err.toString());
			}
		}
	});
};