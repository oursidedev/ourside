/** Browser-only avatar preparation. Native apps should replace this behind the profile service boundary. */
import { AVATAR_MAX_SOURCE_BYTES,AVATAR_MIME_TYPES,AVATAR_VARIANTS } from "./profile.constants";

export type PreparedAvatar={previewUrl:string;variants:Array<{name:keyof typeof AVATAR_VARIANTS;blob:Blob}>};
export async function prepareAvatar(file:File):Promise<PreparedAvatar>{
 if(!AVATAR_MIME_TYPES.includes(file.type as typeof AVATAR_MIME_TYPES[number]))throw new Error("Choose a JPEG, PNG, WebP or AVIF image.");
 if(file.size>AVATAR_MAX_SOURCE_BYTES)throw new Error("Profile photos must be 5 MB or smaller.");
 const bitmap=await createImageBitmap(file,{imageOrientation:"from-image"});const side=Math.min(bitmap.width,bitmap.height);const sx=(bitmap.width-side)/2;const sy=(bitmap.height-side)/2;const variants:PreparedAvatar["variants"]=[];
 try{for(const[name,size]of Object.entries(AVATAR_VARIANTS) as Array<[keyof typeof AVATAR_VARIANTS,number]>){const canvas=document.createElement("canvas");canvas.width=size;canvas.height=size;const context=canvas.getContext("2d",{alpha:false});if(!context)throw new Error("Image processing is unavailable.");context.imageSmoothingEnabled=true;context.imageSmoothingQuality="high";context.drawImage(bitmap,sx,sy,side,side,0,0,size,size);const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("Profile photo could not be prepared.")),"image/webp",.84));variants.push({name,blob});await new Promise<void>(resolve=>setTimeout(resolve,0));}}
 finally{bitmap.close();}
 const medium=variants.find(item=>item.name==="medium")!;return{previewUrl:URL.createObjectURL(medium.blob),variants};
}
