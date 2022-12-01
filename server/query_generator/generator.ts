import fs from "fs";
import path from 'node:path';
import { install as soure_map_support } from 'source-map-support'; soure_map_support();
import * as util from '../src/util.js';

function create_file_context(file_name: string) {
    return {
        file_name: file_name,
        indentation: 0,
        content: "",
        indent: function() {
            this.indentation++
            return this
        },
        deindent: function() {
            this.indentation--
            return this
        },
        write: function(text:string) {
            
            var indentationString = ""
            for (var i = 0; i < this.indentation; i++) { indentationString += "    " }

            const comepleteLine = indentationString + text + "\n"
            
            this.content += comepleteLine
            return this
        },
        new_line: function(numberOfNewLines = 1) {
            for (var i = 0; i < numberOfNewLines; i++) {
                this.content += "\n"
            }
            return this
        },
        save: async function() {
            await fs.promises.writeFile(this.file_name, this.content);
        }
    }
}

function create_source_js(input:any) {

    var f = create_file_context(`${input.name}.js`)

    f.write("import { Database, Statement } from './src/sqlite-async.js';")

    f.write(`export class ${input.name} {`).indent().new_line()

    // Write some code...

    f.deindent().write("}").new_line()

    return f;
    
}

const regexp = /<<(REPEAT):(.+?)>>(.+?)<<REPEAT>>|\{\{(.+?)\}\}/;
function process_template(template: string, input_data: any): string  {
    let repeated: any = {}
    let content = template;
    for (let match = content.match(regexp), result; match;) {
        if (match[0][0] === '<') {
            switch (match[1]) {
                case 'REPEAT': {
                    const content = match[3];
                    const input_object_name = match[2];
                    const repeat_times = input_data[input_object_name].length;
                    console.log(`REPEAT ${input_object_name} X ${repeat_times}: ${content}`);
                    repeated[input_object_name] = {
                        times: 0,
                        processed: []
                    }
                    let expanded = "";
                    for(let i = 0; i < repeat_times; i++) expanded += content;
                    result = expanded;
                } break;
            }
        }
        else {
            const content = match[4];
            console.log(`inject into ${content}`);
            const [ variable, list ] = content.split(":", 2);
            if (list) {
                if (variable === '#') {
                    result = input_data[list][repeated[list].times];
                    repeated[list].times++;
                }
                else {
                    if (repeated[list].processed.includes(variable)) {
                        repeated[list].times++;
                        repeated[list].processed = [];
                    }
                    result = input_data[list][repeated[list].times][variable];
                    repeated[list].processed.push(variable);
                }
            }
            else {
                result = input_data[variable];
            }
        }
        content = content.replace(match[0], result);
        match = content.match(regexp);
    }

    return content;
}

interface list_typed_variables { NAME: string; TYPE: string; }
interface template_input_data {
    COMMENT: string;
    NAME: string;
    IN: list_typed_variables[];
    OUT: list_typed_variables[];
    QUERY_STRING: string;
}

async function main() {
    
    let input_file;
    let template_file;
    let out_file;

    for (let i = 0; i < process.argv.length; i++) {
        let val = process.argv[i];
        
        if (val === '-i') {
            input_file = process.argv[i+1];
        }

        if (val === '-t') {
            template_file = process.argv[i+1];
        }

        if (val === '-o') {
            out_file = process.argv[i+1];
        }
    }

    if (!input_file) throw new Error('Input parameters! Ex: -i ./in.json -t ./template.txt -o ./out.ts')
    if (!template_file) throw new Error('Input parameters! Ex: -i ./in.json -t ./template.txt -o ./out.ts')
    if (!out_file) throw new Error('Input parameters! Ex: -i ./in.json -t ./template.txt -o ./out.ts')

    const template = (await fs.promises.readFile(template_file)).toString()
    let input;
    
    const extension = path.parse(input_file).ext;
    switch (extension) {
        
        case '.json': {
            input = JSON.parse((await fs.promises.readFile(input_file)).toString());
        } break;

        default: { throw new Error(); } break;
    }

    console.log(`Using file ${input_file}`);

    const processed = process_template(template, input.queries[0]);
    await fs.promises.writeFile(out_file, processed);
}

main()
