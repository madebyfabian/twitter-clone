import { z, useValidatedBody } from 'h3-zod'
import { useServerAuthUser } from '@/server/composables/useServerAuthUser'
import { xata } from '@/server/lib/xata'

export default defineEventHandler(async event => {
	const body = await useValidatedBody(
		event,
		z.object({
			post: z.object({
				authorUser: z.object({
					id: z.string(),
					authId: z.string(),
				}),
				content: z.string(),
			}),
		})
	)
	const serverAuthUser = await useServerAuthUser(event)
	if (!serverAuthUser) return sendError(event, createError({ statusCode: 401 }))
	if (serverAuthUser.id !== body.post.authorUser.authId)
		return sendError(event, createError({ statusCode: 403 }))

	const newRecord = await xata.db.post.create({
		authorUser: body.post.authorUser.id,
		content: body.post.content,
		createdAt: new Date(),
		updatedAt: new Date(),
	})
	if (!newRecord) return sendError(event, createError({ statusCode: 500 }))

	return newRecord
})