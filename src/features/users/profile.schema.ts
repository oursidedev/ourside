import { z } from "zod";

export const displayNameSchema=z.string().trim().min(2,"Name must contain at least 2 characters.").max(40,"Name must be 40 characters or fewer.").transform(value=>value.replace(/\s+/g," ")).refine(value=>/[\p{L}\p{N}]/u.test(value),"Name must contain a letter or number.").refine(value=>/^[\p{L}\p{N} '.-]+$/u.test(value),"Use letters, numbers, spaces, apostrophes, dots or hyphens only.");

const commonPasswords=new Set(["password","password123","12345678","qwerty123","admin123","letmein123"]);
export function passwordStrength(value:string,email="",displayName=""){
 let score=0;if(value.length>=8)score++;if(value.length>=12)score++;if(/[a-z]/.test(value)&&/[A-Z]/.test(value))score++;if(/\d/.test(value))score++;if(/[^A-Za-z0-9]/.test(value))score++;
 const lowered=value.toLowerCase();if(commonPasswords.has(lowered)||email&&lowered.includes(email.split("@")[0].toLowerCase())||displayName&&lowered.includes(displayName.toLowerCase().replace(/\s/g,"")))score=Math.min(score,1);
 const level:"weak"|"medium"|"strong"|"excellent"=score<=1?"weak":score<=3?"medium":score===4?"strong":"excellent";
 return{score,level};
}

export const passwordChangeSchema=z.object({currentPassword:z.string().min(1,"Current password is required."),newPassword:z.string().min(8,"Use at least 8 characters.").max(72,"Password is too long."),confirmPassword:z.string()}).superRefine((value,context)=>{if(value.newPassword!==value.confirmPassword)context.addIssue({code:"custom",path:["confirmPassword"],message:"Passwords do not match."});if(value.newPassword===value.currentPassword)context.addIssue({code:"custom",path:["newPassword"],message:"Choose a password different from your current password."});if(commonPasswords.has(value.newPassword.toLowerCase()))context.addIssue({code:"custom",path:["newPassword"],message:"Choose a less common password."});});
