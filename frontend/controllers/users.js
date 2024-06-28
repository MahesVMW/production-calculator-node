const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {promisify} = require("util");

const db=mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
});
exports.login=async(req,res)=>{
try{
const { email,password} = req.body;
if(!email || !password){
    return res.status(400).render("index", {
    msg: "Please Enter Your Email and password", 
    msg_type:"error" ,
});
}
db.query('select * from users where email=?',
[email],
async(error,result)=>{
  console.log(result);
  if(result.length <=0){
    return res.status(401).render("index", {
        msg: "Email or Password Incorrect", 
        msg_type:"error" ,
    });
  }else{
    if(!(await bcrypt.compare(password,result[0].PASS))){
        return res.status(401).render("index", {
            msg: "Email or Password Incorrect", 
            msg_type:"error" ,
        });
    }else{
       const id=result[0].ID;
       const token=jwt.sign({id:id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    });
    console.log("the token is "+token);
    const cookieOptions={
        expires:new Date(
            Date.now() +
        process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
        httpOnly:true,
    };
    res.cookie("mahes",token,cookieOptions);
    res.status(200).redirect("/form");
    }
  }
});
}
catch(error){
console.log(error);
}
};
exports.register=(req,res)=>{
// console.log(req.body);  
// const name=req.body.name;
// const email=req.body.email;
// const password=req.body.password;
// const confirm_password=req.body.confirm_password;
 const {name,email,password,confirm_password } =req.body;
 console.log('Form data:', { name, email, password, confirm_password }); 

 db.query(
    "select * from users where email=?",
 [email],
 async (error, result)=> {
    if (error) { 
        console.log(result);
    }
    if(result.length>0){
         return res.render("register", { msg: "Email Id already taken",msg_type:"error" });
    } else if(password!==confirm_password){
        return res.render("register", { msg: "password do not match",msg_type:"error" }); 
    } 
    let hashedPassword = await bcrypt.hash(password, 8);
    
    db.query("insert into users set ?",
    {name:name,email:email,pass: hashedPassword },
    (error,result) => {
        if(error){
            console.log(error);
        }else{
            console.log(result); 
            return res.render("register", { msg:"User Registration Success",msg_type:"good"});    
        }
      }
    ); 
}  
);
};  
exports.isLoggedIn =async (req,res,next)=>{
    // req.name="Check Login...";
   // console.log(req.cookies);
    if(req.cookies.mahes){
     try{
     const decode = await promisify(jwt.verify)(
        req.cookies.mahes,
        process.env.JWT_SECRET
     );
    // console.log(decode);
     db.query(
        "select * from users where id =?",
        [decode.id],
        (err,results)=>{
           //console.log(results);
           if(!results){
            return next();
           }
           req.user = results[0];
           return next();
     }
     );
     }catch(error){
        console.log(error);
        return next();
     }
    }else{
        next();
    }
};

exports.logout = async (req,res)=>{
    res.cookie("mahes","logout",{
       expires:new Date(Date.now() + 2 * 1000),
       httpOnly:true, 
    });
    res.status(200).redirect("/");
};
exports.dashboard = (req, res) => {
    const { productname, quantity, cost, gstPercentage, productionPrice, WholesalePrice, Traderprice, Retailshopprice, dateInput,roundoffTotalsets,roundofftabletotalunassorted,roundoffmoq,roundoffWholesaleprofit,roundoffTraderprofit,roundoffRetailprofit } = req.body;
    const inputDate = new Date(dateInput);
    const year = inputDate.getFullYear();
    const month = String(inputDate.getMonth() + 1).padStart(2, '0');
    const day = String(inputDate.getDate()).padStart(2, '0');
    const formattedDateInput = `${year}-${month}-${day}`;
    
    console.log('Form data:', { productname, quantity, cost, gstPercentage, productionPrice, WholesalePrice, Traderprice, Retailshopprice, formattedDateInput,roundoffTotalsets,roundofftabletotalunassorted,roundoffmoq,roundoffWholesaleprofit,roundoffTraderprofit,roundoffRetailprofit });

    const sql = "INSERT INTO products (ProductName, Quantity, Cost, GST, productionPrice, WholesalePrice, Traderprice, retailprice, dateInput,Total_sets,Total_unassorted,MOQ,Wholesale_profit,Trader_profit,Retail_profit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?)";
    const values = [productname, quantity, cost, gstPercentage, productionPrice, WholesalePrice, Traderprice, Retailshopprice, formattedDateInput,roundoffTotalsets,roundofftabletotalunassorted,roundoffmoq,roundoffWholesaleprofit,roundoffTraderprofit,roundoffRetailprofit];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.log("Error inserting data: " + err);
            res.status(500).send("Error inserting data");
        } else {
            console.log("Data inserted successfully");
            // Fetch all products after insertion
            db.query("SELECT * FROM products", (err, rows) => {
                if (err) {
                    console.log("Error fetching products: " + err);
                    res.status(500).send("Error fetching products");
                } else {
                    setTimeout(() => {
                        res.render("dashboard", { rows }); // Render the dashboard template with updated data
                    }, 50000); // 50 seconds delay
                }
            });
        }
    });
}

exports.delete = (req, res) => {
    let id = req.params.id;
    db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
        if (!err) {
            res.redirect("/dashboard"); // Redirect to authenticated dashboard after deletion
        } else {
            console.log(err);
            res.status(500).send("Error deleting product");
        }
    });
}

