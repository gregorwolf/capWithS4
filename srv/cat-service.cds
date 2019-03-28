using opensap.PurchaseOrder.BusinessPartner as BPs from '../db/data-model';
using opensap.PurchaseOrder.Headers as Headers from '../db/data-model';
using opensap.PurchaseOrder.Items as Items from '../db/data-model';


service CatalogService {

@readonly entity BusinessPartners as projection on BPs;
 
@readonly entity POs @(
		title: '{i18n>poService}'
	) as projection on Headers;



@radonly entity POItems @(
		title: '{i18n>poService}'
	) as projection on Items;
    
}
