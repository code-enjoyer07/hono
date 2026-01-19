import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import "dotenv/config"
import supabase from './lib/supabase.js'

const app = new Hono()

app.get('/todos', async (c) => {
  try {
    const { data, error: dbError } = await supabase.from('todos').select('*')
    if (dbError) {
      return c.json({ error: dbError.message }, 500)
    }
    if (!data) {
      return c.json({ error: 'No data found' }, 404)
    }
    return c.json(data)
  } catch (error) {
    console.log(error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

app.get('/todos/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const { data, error: dbError } = await supabase.from('todos').select('*').eq('id', id).maybeSingle()
    if (dbError) {
      return c.json({ error: dbError.message }, 500)
    }
    if (!data) {
      return c.json({ error: 'Todo not found' }, 404)
    }
    return c.json(data)
  } catch (error) {
    console.log(error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

app.post('/todos', async (c) => {
  const { content } = await c.req.json()
  if (!content || content == "") {
    return c.json({ error: 'Content is required' }, 400)
  }
  try {
    const { data, error: dbError } = await supabase.from('todos').insert([{ content }]).select().maybeSingle()

    if (dbError) {
      return c.json({ error: dbError.message }, 500)
    }
    return c.json({
      message: 'Todo created successfully',
      data
    }, 201)
  } catch (error) {
    console.log(error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

app.delete('/todos/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const { data, error: dbError } = await supabase.from('todos').delete().eq('id', id).select().maybeSingle()
    if (dbError) {
      return c.json({ error: dbError.message }, 500)
    }
    if (!data) {
      return c.json({ error: 'Todo not found' }, 404)
    }
    return c.json({
      message: 'Todo deleted successfully',
      data
    })
  } catch (error) {
    console.log(error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }
})

app.put('/todos/:id', async (c) => {
  const id = c.req.param('id')
  const { content } = await c.req.json()
  if (!content || content == "") {
    return c.json({ error: 'Content is required' }, 400)
  }

  try {
    const { data, error: dbError } = await supabase.from('todos').update({ content }).eq('id', id).select().maybeSingle()
    if (dbError) {
      return c.json({ error: dbError.message }, 500)
    }
    if (!data) {
      return c.json({ error: 'Todo not found' }, 404)
    }
    return c.json({
      message: 'Todo updated successfully',
      data
    })
  } catch (error) {
    console.log(error)
    return c.json({ error: 'Internal Server Error' }, 500)
  }

})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
