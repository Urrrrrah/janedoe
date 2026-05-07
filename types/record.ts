import {projectSchema} from "@/lib/validator/project";
import { z } from "zod";
import {subprojectSchema} from "@/lib/validator/subproject";
import {userSchema} from "@/lib/validator/sysuser";
import {newUserSchema} from "@/lib/validator/user_register";


export interface Rec {
    sys_id: string;
    created: string;             // datetime
    updated: string;             // datetime
    created_by: string;        // varchar(45)
    updated_by: string;        // varchar(45)
    active: boolean;
}

export interface LoginLogs {
    sys_id: string;
    created: string;             // datetime
    updated: string;             // datetime
    created_by: string;        // varchar(45)
    updated_by: string;        // varchar(45)
    user_id: string;
    login_time: string;
    status: string;
}

export interface ProjectJohoIchiran extends Rec {
    project_id: string;        // varchar(10)
    start_date: string;     // datetime
    end_date: string;     // datetime
    department: string;             // varchar(45)
    project_type: string;  // varchar(45)
    project_name: string;      // varchar(45)
    short_description: string | null; // varchar (允许为空)
}

export interface FormKengenList {
    sys_id: string;
    user_id: string;
    name: string;
}

export type ProjectJohoIchiranForm = z.infer<typeof projectSchema>;

export interface SubprojectJohoIchiran extends Rec {
    subproject_id: string | null;        // varchar(10)
    joi_project_id: string;
    joi_project_ref: string;
    start_date: string;     // datetime
    end_date: string;     // datetime
    subproject_name: string;      // varchar(45)
    short_description: string | null; // varchar (允许为空)
}

export type SubprojectJohoIchiranForm = z.infer<typeof subprojectSchema>;

export type NewUserForm = z.infer<typeof newUserSchema>;

export type SysUserForm = z.infer<typeof userSchema>;

export interface SysUser extends Rec {
    user_id: string;
    first_name: string;
    last_name: string;
    company: string;
}

export interface SanshoKengenList extends Rec {
    reference_table: string;
    reference_ticket: string;
    user_id: string;
    user_name: string;
    user_sys_id: string;
}