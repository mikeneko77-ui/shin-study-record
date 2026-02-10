import { Field } from "@ark-ui/react";
import { Button, Dialog, Input, VStack } from "@chakra-ui/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Record } from "../domain/record";

type RecordFormData = {
  title: string;
  time: number;
};

type RecordsModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, time: number) => Promise<void>;
  editRecord?: Record | null;
};

export const RecordModal = ({
  open,
  onClose,
  onSubmit,
  editRecord,
}: RecordsModalProps) => {
  const isEditMode = !!editRecord;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecordFormData>({
    defaultValues: {
      title: "",
      time: 0,
    },
  });

  // editRecordが変わったらフォームをリセット
  useEffect(() => {
    if (open) {
      if (editRecord) {
        // 編集モード：既存の値をセット
        reset({
          title: editRecord.title,
          time: editRecord.time,
        });
      } else {
        // 新規登録モード：空にリセット
        reset({
          title: "",
          time: 0,
        });
      }
    }
  }, [open, editRecord, reset]);

  const onFormSubmit = async (data: RecordFormData) => {
    await onSubmit(data.title, data.time);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && handleClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="white" p={4}>
          <Dialog.Header>
            <Dialog.Title>{isEditMode ? "記録編集" : "新規登録"}</Dialog.Title>
          </Dialog.Header>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <Dialog.Body>
              <VStack gap={4}>
                <Field.Root invalid={!!errors.title}>
                  <Field.Label>学習内容</Field.Label>
                  <Input
                    placeholder="例: React学習"
                    {...register("title", {
                      required: "内容の入力は必須です",
                    })}
                  />
                  {errors.title && (
                    <Field.ErrorText>{errors.title.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.time}>
                  <Field.Label>学習時間</Field.Label>
                  <Input
                    type="number"
                    placeholder="例: 2"
                    {...register("time", {
                      required: "時間の入力は必須です。",
                      valueAsNumber: true,
                      min: {
                        value: 0,
                        message: "時間は0以上である必要があります。",
                      },
                    })}
                  />
                  {errors.time && (
                    <Field.ErrorText>{errors.time.message}</Field.ErrorText>
                  )}
                </Field.Root>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" mr={3} onClick={handleClose}>
                キャンセル
              </Button>
              <Button
                type="submit"
                colorPalette="blue"
                color="black"
                loading={isSubmitting}
              >
                {isEditMode ? "保存" : "登録"}
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
