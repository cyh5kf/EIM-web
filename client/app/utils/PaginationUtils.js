 import _ from 'underscore';

 module.exports = {
     getPagination: function(pageable) {
         var arr = [],
             i;
         var totalpage = Math.ceil(Number(pageable.total) / Number(pageable.pagesize));
         if (totalpage <= 8) {
             for (i = 1; i <= totalpage; i++) {
                 arr.push(i.toString());
             }
         } else {
             var curGroup = this.getCurrentGroup(pageable);
             if (curGroup * 5 >= totalpage) {
                 for (i = 1; i <= (totalpage - (curGroup - 1) * 5); i++) {
                     arr.push(((curGroup - 1) * 5 + i).toString());
                 }
             } else {
                 for (i = 1; i <= 5; i++) {
                     arr.push(((curGroup - 1) * 5 + i).toString());
                 }
                 arr.push("...");
                 arr.push(totalpage.toString());
             }
         }

         return _.extend({
             "pagegroup": arr,
             "totalpage": totalpage
         }, pageable);
     },
     getCurrentGroup: function(pageable) {
         return Math.ceil(Number(pageable.pagenum) / 5);
     }
 }


 //js获取cookie
 // var acookie = document.cookie.split("; ");

 // function getck(sname) { //获取单个cookies
 //     for (var i = 0; i < acookie.length; i++) {
 //         var arr = acookie[i].split("=");
 //         if (sname == arr[0]) {
 //             if (arr.length > 1)
 //                 return unescape(arr[1]);
 //             else
 //                 return "";
 //         }
 //     }
 //     return "";
 // }
 //给相应的form里的input赋值
 // document.form_name.input_name.value = getck("username");
