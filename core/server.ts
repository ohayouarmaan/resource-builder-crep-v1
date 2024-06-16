import assert from "assert";
import express, { Request, Response } from "express";
import Logic from "./logic";

enum Methods {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}

interface IRoute {
    path: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | null;
    query: {
        [k: string]: string
    }[];
    middlewares: string[];
    routes: IRoute[];
}

interface IConfig {
    port: string | number;
    routes: IRoute[];
    global_vars: Record<string, object>;
}

export default class ServerResource {
    private server: express.Express;
    public routes: IRoute[] = [];
    private config: IConfig | undefined;
    private logic: Record<string, Logic>;

    constructor(logic: Record<string, Logic>) {
        this.server = express();
        this.logic = logic;
    }

    register_config(config: IConfig) {
        this.config = config
        for (const key of Object.keys(this.config.global_vars)) this.server.set(key, this.config.global_vars[key]);
    }

    parse_config() {
        assert(this.config != undefined, "No config passed.");
        this.routes = this.config.routes;
    }

    parse_routes(router?: express.Router, _routes?: IRoute[]) {
        let methods: Record<Methods, Function>;
        if (!router) {
            methods = {
                "GET": this.server.get,
                "POST": this.server.post,
                "PUT": this.server.put,
                "PATCH": this.server.patch,
                "DELETE": this.server.delete,
            }
        } else {
            methods = {
                "GET": router.get,
                "POST": router.post,
                "PUT": router.put,
                "PATCH": router.patch,
                "DELETE": router.delete,
            }
        }
        const routes = _routes || this.routes;
        routes.forEach(route => {
            if (route.routes.length != 0 && route.method != null) {
                const logic_functions: ((req: Request, res: Response) => any)[] = [];
                for (const logic_name of Object.keys(this.logic)) {
                    logic_functions.push(this.logic[logic_name].get_logic() as ((req: Request, res: Response) => any));
                }
                methods[route.method](route.path, ...logic_functions);
            } else {
                const _router = express.Router();
                this.parse_routes(router, route.routes);
                if(router != undefined) {
                    router.use(route.path, _router)
                } else {
                    this.server.use(route.path, _router);
                }
            }
        });
    }
}