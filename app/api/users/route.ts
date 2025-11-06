import { NextRequest } from 'next/server';
import { addUser, listUsers, updateUser, deleteUser } from '@/Users/yashpatel/authentication';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const users = await listUsers();
    return Response.json({ ok: true, users });
  } catch (e: any) {
    console.error('[users][GET] error', e?.message || e);
    return Response.json({ ok: false, error: e?.message || 'Upstream error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, mobile, tempPassword } = body || {};
    if (!name || !email || !mobile || !tempPassword)
      return Response.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    const user = await addUser({ name, email, mobile, tempPassword });
    return Response.json({ ok: true, user });
  } catch (e: any) {
    console.error('[users][POST] error', e?.message || e);
    return Response.json({ ok: false, error: e?.message || 'Upstream error' }, { status: 500 });
  }
}

// (Removed older PUT/DELETE variants to avoid duplicate exports)

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, mobile, tempPassword } = body || {};
    if (!id || !name || !email || !mobile)
      return Response.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    const user = await updateUser({ id: Number(id), name, email, mobile, tempPassword });
    return Response.json({ ok: true, user });
  } catch (e: any) {
    console.error('[users][PUT] error', e?.message || e);
    return Response.json({ ok: false, error: e?.message || 'Upstream error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    let id = idParam ? Number(idParam) : 0;
    if (!id) {
      try { const b = await req.json(); id = Number(b?.id || 0); } catch {}
    }
    if (!id) return Response.json({ ok: false, error: 'Missing id' }, { status: 400 });
    const ok = await deleteUser(id);
    return Response.json({ ok });
  } catch (e: any) {
    console.error('[users][DELETE] error', e?.message || e);
    return Response.json({ ok: false, error: e?.message || 'Upstream error' }, { status: 500 });
  }
}
