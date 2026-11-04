
const calculateOrderTotal = (items) => {
    let subtotal = 0;
     
    const orderItems = items.map((item) => {
        const unitPrice = Number(item.price);
        const quantity = Number(item.quantity);

        if(
            !Number.isFinite(unitPrice) ||
            unitPrice < 0 ||
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            throw new Error("Invalid item price or quantity");
        }

         const lineTotal = unitPrice * quantity;
         subtotal += lineTotal;

         return {
            menuItem: item._id,
            itemName: item.name,
            unitPrice,
            quantity,
            lineTotal
        };
    });
    return {
        orderItems,
        subtotal,
        total: subtotal
    };
};

module.exports = calculateOrderTotal;
