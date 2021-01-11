const fs = require("fs");

module.exports.replace = (template, data) => {
    const pattern = /\<%==(.*?)\%=>/g; // %%property%%
    return template.replace(pattern, (match, token) => data[token]);
}


module.exports.extractDataToString = (fileUrl) => {
    return new Promise((resolve, reject) => {
        fs.readFile(`${__dirname}/templates/${fileUrl}`, "utf8", function read(error, html) {
            if (error) {
                reject(error);
            }
            resolve(html);
        });
    });
} 
