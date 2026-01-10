import { get, post } from "@/services/services.config.ts";
import { toast } from "vue-sonner";

export async function getItemQuestions(itemId: string): Promise<any> {
    try {
        const url = 'item/'+itemId+'/question'
        return await get(url)
    } catch (err) {
        console.error("Search failed:", err)
        toast.error(err?.error_message || "Unable to fetch results from the server.")
        return []
    }
}

export async function submitQuestionAnswer(questionId: string,body: any, auth: string ): Promise<any> {
    try {
        const url = 'question/'+questionId
        console.log(url)
        return await post(url,body,auth)
    } catch (err) {
        console.error("Search failed:", err)
        toast.error(err?.error_message || "Unable to fetch results from the server.")
        return []
    }
}
