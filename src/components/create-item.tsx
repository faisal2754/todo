import { Item } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { typeToFlattenedError, z } from 'zod'

import { queryClient } from '@/pages/_app'
import s from '@/styles/create-item.module.scss'
import Image from 'next/future/image'

type CreateItemResponse = {
  success: boolean
  data: Item | null
  errors: typeToFlattenedError<typeof ZodItemCreate> | null
}

const ZodItemCreate = z.object({
  listId: z.number(),
  description: z.string(),
})

type ItemCreate = {
  listId: number | undefined
  description: string
}

type CreateItemProps = {
  activeListId: number | undefined
}

const CreateItem = ({ activeListId }: CreateItemProps) => {
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const createItemMutation = useMutation<
    CreateItemResponse,
    CreateItemResponse,
    ItemCreate
  >(
    (data) => {
      return axios.post('/api/item/create', data)
    },
    {
      onMutate: () => {
        setIsLoading(true)
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['items'])
        setDescription('')
        toast.success('Item created!')
      },
      onError: (err) => {
        console.log(err)
        toast.error('Something went wrong :(')
      },
      onSettled: () => {
        setIsLoading(false)
      },
    }
  )

  const handleCreateItem = (e: any) => {
    if (e.type === 'keypress' && e.key !== 'Enter') return
    if (description === '') return
    if (isLoading) return
    createItemMutation.mutate({ listId: activeListId, description })
  }

  return (
    <>
      <div className={s.newItem}>
        <div className={s.input}>
          <input
            type='text'
            placeholder='Add an item'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyPress={handleCreateItem}
          />
          <Image
            src='/plus-black.svg'
            alt='addItem'
            width={50}
            height={50}
            title='Add item'
            className={s.addIcon}
            onClick={handleCreateItem}
          />
        </div>
      </div>
    </>
  )
}
export default CreateItem
