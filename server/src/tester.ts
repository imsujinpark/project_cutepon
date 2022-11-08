export interface tester_on_start { (): Promise<any> };
export interface tester_on_end { (user_data: any): Promise<void> };
export interface tester_all_tests { (tester: Tester, user_data: any): Promise<void> };
export class Tester {

    // behold my testing library:
    readonly name: string;
    readonly on_start: tester_on_start|null;
    readonly on_end: tester_on_end|null;
    readonly all_tests: tester_all_tests;
    
    user_data: any;
    current_test_name: string = "No test assigned yet";

    constructor(name: string, on_start: tester_on_start|null, on_end: tester_on_end|null, all_tests: tester_all_tests) {
        this.name = name;
        this.on_start = on_start;
        this.on_end = on_end;
        this.all_tests = all_tests;
    }

    expect(thing: boolean) {
        if (!thing) throw new Error("Lower your expectations!");
    }

    success() {
        console.log("Test OK! " + this.current_test_name);
    }

    failed(error: Error) {
        console.log("Test FAIL! " + this.current_test_name);
        console.log(error);
    }

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

    async test(name: string, testing_function: () => Promise<void>) {
        this.current_test_name = name;
        try {
            await testing_function();
            this.success();
        } catch (e) { this.failed(e as Error); }
        return;
    }

    async run() {
        
        if (this.on_start !== null) { this.user_data = await this.on_start(); }

        try {
            await this.all_tests(this, this.user_data);
        }
        finally {
            if (this.on_end !== null) { await this.on_end(this.user_data); }
        }

    }
}
