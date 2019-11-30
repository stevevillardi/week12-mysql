const mysql = require("mysql");
const inquirer = require("inquirer");

var questions = [
	{
		type: "input",
		name: "product_id",
		message:
			"Which product would you like to buy? Enter the ID of the associated product:"
	},
	{
		type: "input",
		name: "product_quantity",
		message: "How many units would you like to buy:"
	}
];
const connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "root",
	database: "bamazon"
});

connection.connect(function(err) {
	if (err) throw err;
});

function createProduct() {
	console.log("Inserting a new product...\n");
	var query = connection.query(
		"INSERT INTO products SET ?",
		{
			flavor: "Rocky Road",
			price: 3.0,
			quantity: 50
		},
		function(err, res) {
			if (err) throw err;
			console.log(res.affectedRows + " product inserted!\n");
			// Call updateProduct AFTER the INSERT completes
			updateProduct();
		}
	);

	// logs the actual query being run
	console.log(query.sql);
}

function updateProduct(item, amount) {
	connection.query(`SELECT * FROM products WHERE item_id = ${item}`, function(
		err,
		res
	) {
		if (err) throw err;
		if (amount > res[0].stock_quantity) {
			console.log(
				`Insufficient quantity, only ${res[0].stock_quantity} in stcok!`
			);
			connection.end();
		} else {
			let updatedStock = res[0].stock_quantity - amount;
			const query = connection.query(
				`UPDATE products SET stock_quantity = ${updatedStock} WHERE item_id = ${item}`,
				function(err, res) {
					if (err) throw err;
					console.log(res.affectedRows + " products updated!\n");
					connection.end();
				}
			);

			//console.log(query.sql);
		}
	});
}

function deleteProduct() {
	console.log("Deleting all strawberry icecream...\n");
	connection.query(
		"DELETE FROM products WHERE ?",
		{
			flavor: "strawberry"
		},
		function(err, res) {
			if (err) throw err;
			console.log(res.affectedRows + " products deleted!\n");
			// Call readProducts AFTER the DELETE completes
			readProducts();
		}
	);
}

function readProducts() {
	connection.query("SELECT * FROM products", function(err, res) {
		if (err) throw err;
		res.forEach((obj, i) => {
			console.log(
				`ID:${obj.item_id}) ${obj.product_name}: $${obj.price} - ${obj.stock_quantity} in stock`
			);
		});
		inquirer.prompt(questions).then(answers => {
			const productID = answers.product_id;
			const quantity = answers.product_quantity;
			updateProduct(productID, quantity);
		});
	});
}

readProducts();
