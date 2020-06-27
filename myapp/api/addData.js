var express = require('express');
var router = express.Router();
var empModal = require('../module/employee');
// var insertDtaIs = require('../api/insertData');
var employee = empModal.find({},{name:1,email:1,etype:1,hourlyrate:1,totalHour:1,total:1,_id:1});

router.get('/',function(req,res,next){
    // employee.exec(function(err,data){
    //     if(err) throw err;
    //     // res.send("Node js get REST ful API ....."+data)
    //     res.status(200).json({
    //         message : "ok",
    //         results:data
    //     })
    // })
    employee.exec()
    .then(data=>{
        res.status(200).json({
            message : 'ok',
            results : data
        })
    })
    .catch(err=>{
        res.json(err)
    })
})

router.post('/add-data',function(req,res,next){
    var empDetails = new empModal({
        require :true,
        // index:{
        //     unique : true
        // },
        name:req.body.userName,
        email:req.body.email,
        etype:req.body.etype,
        hourlyrate:req.body.hourlyrate,
        totalHour:req.body.totalHour,
        // total : parseInt(req.body.hourlyrate) * parseInt(req.body.totalHour)
      }); 

    //   empDetails.save(function(err,doc){
    //       if(err) throw error;
    //       res.send("Node js POST api ....."+doc)
    //   })
    empDetails.save().then(doc=>{
        res.status(201).json({
            message : " data inserted successfully...",
            results : doc
        })
    }).catch(error=>{
        res.json(error)
    })
})

// router.put('/data-update/:id',function(req,res,next){
//     var id = req.params.id;
//     var nameIs = req.body.userName;
//   var update= empModal.findById(id,function(err,data){
//         data.name=nameIs?nameIs:req.body.userName,
//        data.email=req.body.email,
//        data.etype=req.body.etype,
//        data.hourlyrate=req.body.hourlyrate,
//       data.totalHour=req.body.totalHour,
//       data.total = parseInt(req.body.hourlyrate) * parseInt(req.body.totalHour)
        
//         })
//         update.save(function(err,doc){
//             if(err) throw err;
//             res.send("updated successfully")
//         })
// })


router.delete("/delete-user/:id",function(req,res,next){
    var user_id = req.params.id;
    empModal.findByIdAndRemove(user_id,function(err){
        if(err) throw err;
        res.send("SuccessFully deleted..")
    })
})

// router.delete("/delete-user",function(req,res,next){
//     var user_id = req.body._id;
//     empModal.findByIdAndRemove(user_id,function(err){
//         if(err) throw err;
//         res.send("SuccessFully deleted..")
//     })
// })

module.exports = router;