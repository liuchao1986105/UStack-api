import xml2js from 'xml2js';
import config from '../../config/env';

const builder = new xml2js.Builder();
const parseString = xml2js.parseString;

export default class Xml {
  static buildXml(obj) {
// var obj ={business:
//   {
//     account:
//     {
//       _:"233",
//       "$": 
//       {
//         "accountNumber":"0012345",
//         "balance":"123"
//       }
//     },
//     owner:"Nic Raboy"
//   }
// };

    //,"employee":[{"firstname":"Nic","lastname":"Raboy"},{"
//firstname":"Maria","lastname":"Campos"}]}}'
    var xml = builder.buildObject(obj);
    return xml;
  }

  static parseXml(info, cb){
    parseString(info, { explicitArray : false, ignoreAttrs : false }, function (err, result) {
        if(err){
          global.logger.info("parseXml:"+err)
        }
        cb(result)
    });

  }

}
