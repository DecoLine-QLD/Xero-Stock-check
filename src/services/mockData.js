export const mockStockData = {
    Pagination: {
        NumberOfItems: 6,
        PageSize: 50,
        PageNumber: 1,
        NumberOfPages: 1
    },
    Items: [
        {
            ProductCode: "LAP-M1-13",
            ProductDescription: "MacBook Pro M1 13-inch",
            AvailableQty: 45,
            AllocatedQty: 5,
            StockOnHand: 50,
            OnPurchase: 25,
            ProductGroupName: "Laptops",
            LastModifiedOn: new Date().toISOString()
        },
        {
            ProductCode: "LAP-M2-16",
            ProductDescription: "MacBook Pro M2 Max 16-inch",
            AvailableQty: 12,
            AllocatedQty: 2,
            StockOnHand: 14,
            OnPurchase: 0,
            ProductGroupName: "Laptops",
            LastModifiedOn: new Date().toISOString()
        },
        {
            ProductCode: "ACC-USB-C",
            ProductDescription: "USB-C Digital AV Multiport Adapter",
            AvailableQty: 120,
            AllocatedQty: 10,
            StockOnHand: 130,
            OnPurchase: 150,
            ProductGroupName: "Accessories",
            LastModifiedOn: new Date().toISOString()
        },
        {
            ProductCode: "MON-STUDIO",
            ProductDescription: "Apple Studio Display",
            AvailableQty: 3,
            AllocatedQty: 0,
            StockOnHand: 3,
            OnPurchase: 10,
            ProductGroupName: "Monitors",
            LastModifiedOn: new Date().toISOString()
        },
        {
            ProductCode: "PHN-IP15P",
            ProductDescription: "iPhone 15 Pro 256GB Titanium",
            AvailableQty: 0,
            AllocatedQty: 8,
            StockOnHand: 8,
            OnPurchase: 50,
            ProductGroupName: "Phones",
            LastModifiedOn: new Date().toISOString()
        },
        {
            ProductCode: "ACC-MM",
            ProductDescription: "Magic Mouse - Black Multi-Touch",
            AvailableQty: 15,
            AllocatedQty: 1,
            StockOnHand: 16,
            OnPurchase: 0,
            ProductGroupName: "Accessories",
            LastModifiedOn: new Date().toISOString()
        }
    ]
};
