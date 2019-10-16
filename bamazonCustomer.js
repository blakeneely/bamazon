// Add requirements
var mysql = require("mysql");
var inquirer = require("inquirer");

// Connect to database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "H8ter12!",
    database: "bamazon"
});

connection.connect(function(err){
    if(err) throw err;
    console.log("connected to database");
    showAllStock();
});

// Method to get data from database table and display in console neatly
function showAllStock(){
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("Item ID: " + res[i].item_id + " || " + "Product: " + res[i].product_name + " || " + "Price: " + res[i].price + " || " + "Quantity: " + res[i].stock_quantity + " || " + "Department Name: " + res[i].department_name + "\n");
        }
        // Run Inquirer Prompt method passing the res as an argument
        getResponse(res);
    })
};

// Inquirer Prompt method to get user input of what to buy and quantity, set res as a parameter
function getResponse(res) {
    inquirer.prompt([
        {
            type: "input",
            name: "product",
            message: "Type the Item ID of the item you would like to purchase. Type END to exit."
        }
    ]).then(function(answer){
        let flag = false;
        // Exit prompt check
        if(answer.product.toUpperCase() === "END") {
            process.exit();
        }
        // Loop through database and check if item_id matches ID entered
        for(var i = 0; i < res.length; i++){
            if(res[i].item_id == answer.product){
                flag = true;
                let product = res[i].product_name;                  // Store result product name for ease of typing later
                let price = res[i].price;                           // Store result price for typing later
                let id = i;                                         // Store i count to use later
                inquirer.prompt([
                    {
                        type: "input",
                        name: "quantity",
                        message: "How many would you like to purchase?",
                        validate: function(value) {
                            if(isNaN(value) == false) {             // Validate a number was entered
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }
                ]).then(function(answer){
                    if((res[id].stock_quantity - answer.quantity) > 0) {    // Check if stock_quantity is available
                        // Store total purchase price to variable
                        let totalPrice = price * answer.quantity;
                        // Cut off total price to 2 decimals
                        totalPrice = totalPrice.toFixed(2);
                        // Update database with new stock_quantity and display updated table in console
                        connection.query("UPDATE products SET stock_quantity='"+(res[id].stock_quantity - answer.quantity) + "' WHERE product_name= '" + product + "'", function(err, res2) {
                            if (err) throw err;
                            console.log("-----------------------------------------------------------------------");
                            console.log("********* Purchase of " + answer.quantity + " " + product + " for $" + totalPrice + " made! *********");
                            console.log("-----------------------------------------------------------------------");
                            showAllStock();
                        })
                    }else {
                        console.log("-----------------------------------------------------------------------");
                        console.log("********* Not enough in invetory, please choose again. *********");
                        console.log("-----------------------------------------------------------------------");
                        getResponse(res);
                    }
                })
            }
        }
        // Validate user response and run Inquirer again if not
        if(i == res.length && flag === false) {
            console.log("********* Not a valid selection, please choose again. *********")
            console.log("-----------------------------------------------------------------------");
            getResponse(res);
        }
    })
}
