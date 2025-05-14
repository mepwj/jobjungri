import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// POST /api/test - 데이터 추가
export async function POST(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(); // MongoDB 데이터베이스 사용
    const body = await req.json();
    const { name, description } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "이름과 설명이 필요" },
        { status: 400 }
      );
    }

    const result = await db.collection("test").insertOne({ name, description });
    return NextResponse.json({
      message: "삽입됨",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("삽입 오류", error);
    return NextResponse.json({ error: "삽입 실패" }, { status: 500 });
  }
}

// GET /api/test - 전체 조회 또는 id/name 단일 조회
// ?id=
// ?name=
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const name = searchParams.get("name");

    if (id) {
      const { ObjectId } = await import("mongodb");
      const item = await db
        .collection("test")
        .findOne({ _id: new ObjectId(id) });
      return NextResponse.json(item);
    }

    if (name) {
      const item = await db.collection("test").findOne({ name });
      return NextResponse.json(item);
    }

    const items = await db.collection("test").find().toArray();
    const result = items.map(({ _id, ...rest }) => ({
      id: _id.toString(),
      ...rest,
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "조회 실패" }, { status: 500 });
  }
}

// PUT /api/test - 항목 수정
export async function PUT(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const body = await req.json();
    const { id, name, description } = body;

    if (!id || !name || !description) {
      return NextResponse.json(
        { error: "id, name, description 필요" },
        { status: 400 }
      );
    }

    const { ObjectId } = await import("mongodb");
    const result = await db
      .collection("test")
      .updateOne({ _id: new ObjectId(id) }, { $set: { name, description } });

    return NextResponse.json({
      message: "수정됨",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    return NextResponse.json({ error: "수정 실패" }, { status: 500 });
  }
}

// DELETE /api/test - 항목 삭제
export async function DELETE(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "id 필요" }, { status: 400 });
    }

    const { ObjectId } = await import("mongodb");
    const result = await db
      .collection("test")
      .deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      message: "삭제됨",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return NextResponse.json({ error: "삭제 실패" }, { status: 500 });
  }
}
