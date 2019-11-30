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

function updateProduct(item, amount) {
	if (isNaN(item) || isNaN(amount)) {
		console.log(
			`Invalid item_id or amount type, please choose a valid product...`
		);
		promptUser();
	} else {
		connection.query(`SELECT * FROM products WHERE item_id = ${item}`, function(
			err,
			res
		) {
			if (err) throw err;
			if (res.length === 0) {
				console.log(`Invalid item_id, please choose a valid product...`);
				promptUser();
			} else if (amount > res[0].stock_quantity) {
				console.log(
					`Insufficient quantity, only ${res[0].stock_quantity} in stock!`
				);
				promptUser();
			} else {
				let updatedStock = res[0].stock_quantity - amount;
				const query = connection.query(
					`UPDATE products SET stock_quantity = ${updatedStock} WHERE item_id = ${item}`,
					function(err, res) {
						if (err) throw err;
						console.log(res.affectedRows + " products updated!\n");
						readProducts();
					}
				);

				//console.log(query.sql);
			}
		});
	}
}

function readProducts() {
	connection.query("SELECT * FROM products", function(err, res) {
		if (err) throw err;
		res.forEach((obj, i) => {
			console.log(
				`ID:${obj.item_id}) ${obj.product_name}: $${obj.price} - ${obj.stock_quantity} in stock`
			);
		});
		promptUser();
	});
}

function promptUser() {
	inquirer.prompt(questions).then(answers => {
		const productID = answers.product_id;
		const quantity = answers.product_quantity;
		updateProduct(productID, quantity);
	});
}
readProducts();
