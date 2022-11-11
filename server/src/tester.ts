import * as util from "util"

export interface tester_on_start { (tester: Tester): Promise<any> };
export interface tester_on_end { (tester: Tester, user_data: any): Promise<void> };
export interface tester_all_tests { (tester: Tester, user_data: any): Promise<void> };
export class Tester {

    // behold my testing library:
    readonly name: string;
    readonly on_start: tester_on_start|null;
    readonly on_end: tester_on_end|null;
    readonly all_tests: tester_all_tests;
    
    user_data: any;
    current_test_name: string = "No test assigned yet";
    padding: string = "";
    scope_number: number = 0;

    constructor(name: string, on_start: tester_on_start|null, on_end: tester_on_end|null, all_tests: tester_all_tests) {
        this.name = name;
        this.on_start = on_start;
        this.on_end = on_end;
        this.all_tests = all_tests;
    }

    expect(thing: boolean): void {
        if (!thing) throw new Error("Lower your expectations!");
    }

    expect_equal(thing1: number, thing2: number): void;
    expect_equal(thing1: string, thing2: string): void;
    expect_equal(thing1: any, thing2: any): void {
        if (thing1 !== thing2) {
            throw new Error(`Lower your expectations! ${thing1} is different from ${thing2}`);
        }
    }

    log(err: Error): void;
    log(msg: string): void;
    log(msg: any): void;
    log(msg: any): void {
        
        if (typeof msg === 'string') {
            console.log(this.padding + msg.replace("\n","\n" + this.padding))
        }
        else {
            const formatted = util.inspect(msg, { showHidden: false, depth: null, colors: true })
            console.log(this.padding + formatted.replace(/(?:\r\n|\r|\n)/g,"\n" + this.padding))
        }
        
    }
    private scope() { this.padding += ":   "; this.scope_number++; }
    private descope() { this.scope_number--; this.padding = this.padding.substring(0, this.scope_number*4);  }

    async expect_throw(throwing_function: () => Promise<void>, error_checker: (error: any) => void) {
        
        let has_thrown = false;
        try {
            await throwing_function();
        }
        catch (e) {
            has_thrown = true;
            error_checker(e);
        }
        
        if (!has_thrown) throw new Error("Expected to throw, but it didn't!");

    }

    async test(name: string, test_function: () => Promise<void>) {
        
        this.log(`test "${name}"`);
        this.scope();

        this.current_test_name = name;
        try {

            await test_function();

            this.log(`Test OK!`);

        }
        catch (e) {

            this.log("Test FAILED with exception:");
            this.log(e);
            
        }
        
        this.descope();
        this.log("");
    }

    async run() {
        
        this.log(`Test suite "${this.name}"`);
        this.scope();

        if (this.on_start !== null) {
            this.log(`Running on_start...`);
            this.scope();
            this.user_data = await this.on_start(this);
            this.descope();
            this.log("");
        }

        try {
            await this.all_tests(this, this.user_data);
        }
        catch (e) {
            this.log("####################################");
            this.log("Uncaught error stopped the test run!\n");
            this.log("####################################");
            this.log(e);
        }
        finally {
            if (this.on_end !== null) {
                this.log(`Running on_end...`);
                this.scope();
                await this.on_end(this, this.user_data);
                this.descope();
                this.log("");
            }
        }
        this.descope();
        this.log("");

    }
}
