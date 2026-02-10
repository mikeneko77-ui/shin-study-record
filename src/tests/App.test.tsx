import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import * as supabaseModule from "../utils/supabase";
import type { Record } from "../domain/record";
import userEvent from "@testing-library/user-event";
import App from "../App";

vi.mock("../utils/supabase", () => ({
  selectAllRecords: vi.fn(),
  insertRecord: vi.fn(),
  deleteRecord: vi.fn(),
  updateRecord: vi.fn(),
}));

const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

const createRecord = (id: string, title: string, time: number): Record => ({
  id,
  title,
  time,
});

describe("ローディング", () => {
  it("ローディング画面が表示される", () => {
    vi.mocked(supabaseModule.selectAllRecords).mockImplementation(
      () => new Promise(() => {})
    );
    renderWithChakra(<App />);
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });
});

describe("タイトル", () => {
  it("タイトルが表示される", async () => {
    vi.mocked(supabaseModule.selectAllRecords).mockResolvedValue([]);

    renderWithChakra(<App />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "学習記録アプリ" })
      ).toBeInTheDocument();
    });
  });
});

describe("テーブル表示", () => {
  it("データ取得後にテーブルが表示される", async () => {
    const records = [
      createRecord("1", "React学習", 2),
      createRecord("2", "TypeScript学習", 3),
    ];
    vi.mocked(supabaseModule.selectAllRecords).mockResolvedValue(records);

    renderWithChakra(<App />);

    await waitFor(() => {
      expect(screen.getByText("React学習")).toBeInTheDocument();
      expect(screen.getByText("TypeScript学習")).toBeInTheDocument();
    });
  });

  it("記録がない場合はメッセージが表示される", async () => {
    vi.mocked(supabaseModule.selectAllRecords).mockResolvedValue([]);

    renderWithChakra(<App />);
    await waitFor(() => {
      expect(screen.getByText("学習記録がありません")).toBeInTheDocument();
    });
  });
});

describe("新規登録ボタン", () => {
  it("新規登録ボタンが表示される", async () => {
    vi.mocked(supabaseModule.selectAllRecords).mockResolvedValue([]);
    renderWithChakra(<App />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "新規登録" })
      ).toBeInTheDocument();
    });
  });
});

describe("登録のモーダル", () => {
  it("新規登録ボタンをクリックするとモーダルが表示される", async () => {
    const user = userEvent.setup();
    vi.mocked(supabaseModule.selectAllRecords).mockResolvedValue([]);
    renderWithChakra(<App />);

    const addButton = await screen.findByRole("button", { name: "新規登録" });
    await user.click(addButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("新規登録のモーダルのタイトルが新規登録である", async () => {
    const user = userEvent.setup();
    vi.mocked(supabaseModule.selectAllRecords).mockResolvedValue([]);
    renderWithChakra(<App />);
    const addButton = await screen.findByRole("button", { name: "新規登録" });
    await user.click(addButton);
    expect(
      screen.getByText("新規登録", { selector: "h2" })
    ).toBeInTheDocument();
  });

  it("登録できること", async () => {
    const user = userEvent.setup();
    vi.mocked(supabaseModule.selectAllRecords).mockResolvedValue([]);
    vi.mocked(supabaseModule.insertRecord).mockResolvedValue(
      createRecord("1", "React学習", 2)
    );

    renderWithChakra(<App />);
    const addButton = await screen.findByRole("button", { name: "新規登録" });
    await user.click(addButton);

    const titleInput = screen.getByPlaceholderText("例: React学習");
    const timeInput = screen.getByPlaceholderText("例: 2");
    const submitButton = screen.getByRole("button", { name: "登録" });

    await user.type(titleInput, "React学習");
    await user.clear(timeInput);
    await user.type(timeInput, "2");
    await user.click(submitButton);

    await waitFor(() => {
      expect(supabaseModule.insertRecord).toHaveBeenCalledWith("React学習", 2);
    });
  });
});

describe("バリデーションエラー", () => {
  it("学習内容が未入力エラーで表示される", async () => {
    const user = userEvent.setup();
    vi.mocked(supabaseModule.selectAllRecords).mockResolvedValue([]);

    renderWithChakra(<App />);

    const addButton = await screen.findByRole("button", { name: "新規登録" });
    await user.click(addButton);

    const submitButton = screen.getByRole("button", { name: "登録" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("内容の入力は必須です")).toBeInTheDocument();
    });
  });

  it("学習時間が0未満でエラーが表示される", async () => {
    const user = userEvent.setup();
    vi.mocked(supabaseModule.selectAllRecords).mockResolvedValue([]);

    renderWithChakra(<App />);

    const addButton = await screen.findByRole("button", { name: "新規登録" });
    await user.click(addButton);

    const titleInput = screen.getByPlaceholderText("例: React学習");
    await user.type(titleInput, "React学習");

    const timeInput = screen.getByPlaceholderText("例: 2");
    fireEvent.change(timeInput, { target: { value: "-1" } });

    const submitButton = screen.getByRole("button", { name: "登録" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("時間は0以上である必要があります。")
      ).toBeInTheDocument();
    });
  });
});

describe("削除", () => {
  it("削除ができること", async () => {
    const user = userEvent.setup();
    const records = [
      createRecord("1", "React学習", 2),
      createRecord("2", "TypeScript学習", 3),
    ];
    vi.mocked(supabaseModule.selectAllRecords).mockResolvedValue(records);
    vi.mocked(supabaseModule.deleteRecord).mockResolvedValue(true);

    renderWithChakra(<App />);

    const deleteButton = await screen.findAllByRole("button", { name: "削除" });
    await user.click(deleteButton[0]);
    await waitFor(() => {
      expect(supabaseModule.deleteRecord).toHaveBeenCalledWith("1");
    });

    await waitFor(() => {
      expect(screen.queryByText("React学習")).not.toBeInTheDocument();
      expect(screen.getByText("TypeScript学習")).toBeInTheDocument();
    });
  });
});

describe("編集", () => {
  it("モーダルのタイトルが記録編集である", async () => {
    const user = userEvent.setup();
    const records = [
      createRecord("1", "React学習", 2),
      createRecord("2", "TypeScript学習", 3),
    ];
    vi.mocked(supabaseModule.selectAllRecords).mockResolvedValue(records);
    vi.mocked(supabaseModule.updateRecord).mockResolvedValue(
      createRecord("1", "JavaScript学習", 1)
    );

    renderWithChakra(<App />);

    const editButton = await screen.findAllByRole("button", { name: "編集" });
    await user.click(editButton[0]);
    await waitFor(() => {
      expect(screen.getByText("記録編集")).toBeInTheDocument();
    });
  });

  it("編集して登録すると更新される", async () => {
    const user = userEvent.setup();
    const records = [createRecord("1", "React学習", 2)];

    vi.mocked(supabaseModule.selectAllRecords).mockResolvedValue(records);
    vi.mocked(supabaseModule.updateRecord).mockResolvedValue(
      createRecord("1", "JavaScript学習", 1)
    );

    renderWithChakra(<App />);
    const editButton = await screen.findAllByRole("button", { name: "編集" });
    await user.click(editButton[0]);
    const titleInput = screen.getByPlaceholderText("例: React学習");
    await user.clear(titleInput);
    await user.type(titleInput, "JavaScript学習");
    const timeInput = screen.getByPlaceholderText("例: 2");

    await user.clear(timeInput);
    await user.type(timeInput, "1");

    const savedButton = screen.getByRole("button", { name: "保存" });
    await user.click(savedButton);

    await waitFor(() => {
      expect(supabaseModule.updateRecord).toHaveBeenCalledWith(
        "1",
        "JavaScript学習",
        1
      );
    });
  });
});
