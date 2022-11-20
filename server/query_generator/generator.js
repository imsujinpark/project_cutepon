const fs = require("fs");

/**
 * Returns an object that acts as a FileWriter of sorts.
 * It merely knows how to write indented code and save itself as an actual file in the file system.
 */
function createFileWriter(fileName) {
    return {
        fileName: fileName,
        indentation: 0,
        content: "",
        increaseIndentation: function() {
            this.indentation++
            return this
        },
        decreaseIndentation: function() {
            this.indentation--
            return this
        },
        writeIndentedLine: function(line) {
            
            var indentationString = ""
            for (var i = 0; i < this.indentation; i++) { indentationString += "    " }

            const comepleteLine = indentationString + line + "\n"
            
            this.content += comepleteLine
            return this
        },
        newLine: function(numberOfNewLines = 1) {
            for (var i = 0; i < numberOfNewLines; i++) {
                this.content += "\n"
            }
            return this
        },
        save: function() {
            fs.writeFile(this.fileName, this.content, function (err) {
                if (err) { throw err }
            });
        }
    }
}

/** Creates a FileWriter, generates the source code, and returns it */
function generateSourceFile(input) {

    var f = createFileWriter(`${input.name}.js`)

    f.writeIndentedLine("import { Database, Statement } from './src/sqlite-async.js';")

    f.writeIndentedLine(`export class ${input.name} {`).increaseIndentation().newLine()

    // Write some code...

    f.decreaseIndentation().writeIndentedLine("}").newLine()

    return f;
    
}

function main() {
    
    let dataFile = "./data.csv"

    for (let i = 0; i < process.argv.length; i++) {
        let val = process.argv[i];
        if (val.startsWith("--file:")) {
            dataFile = val.split(':').at(1)
        }
    }

    console.log(`Using file ${dataFile}`)
    console.log(`Using file ${dataFile}`)

    const data = require(dataFile)
    
    data.queries.forEach(query => {
    
        console.log(`Generating source for query ${query.name}...`)
        var file = generateSourceFile(query)
        file.save()
    
    })

}

main()