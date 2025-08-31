"use server";

import { AddPostRequestBody } from "@/app/api/posts/route";
import generateSASToken, { containerName } from "@/lib/generateSASToken";

import sql from "@/lib/neon";
import { IUser } from "@/types/user";
import { BlobServiceClient } from "@azure/storage-blob";
import { currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export default async function createPostAction(formData: FormData) {
  const user = await currentUser();
  const postInput = formData.get("postInput") as string;
  const image = formData.get("image") as File;
  let image_url = undefined;

  if (!postInput) {
    throw new Error("Post input is required");
  }

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const userDB: IUser = {
    userId: user.id,
    userImage: user.imageUrl,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
  };

  try {
    if (image && image.size > 0) {
      // Generate a unique blob name
      const blobName = `${user.id}-${Date.now()}-${randomUUID()}`;
      // Get SAS token
      const sasToken = await generateSASToken();
      // Create BlobServiceClient
      const accountName = process.env.AZURE_STORAGE_NAME;
      const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;
      const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net?${sasToken}`);
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      // Upload image
      const arrayBuffer = await image.arrayBuffer();
      await blockBlobClient.uploadData(new Uint8Array(arrayBuffer), {
        blobHTTPHeaders: { blobContentType: image.type }
      });
      // Save image URL with SAS token
      image_url = `${blobUrl}?${sasToken}`;
    }
    // Insert post into PostgreSQL
    const result = await sql`
      INSERT INTO posts (user_id, user_image, first_name, last_name, text, image_url, created_at)
      VALUES (${userDB.userId}, ${userDB.userImage}, ${userDB.firstName}, ${userDB.lastName}, ${postInput}, ${image_url ?? null}, CURRENT_TIMESTAMP AT TIME ZONE 'UTC')
      RETURNING *;
    `;
    revalidatePath("/");
    return result[0];
  } catch (error: any) {
    throw new Error("Failed to create post: " + error.message);
  }
}