import type { MigrationChoice } from "../sync/syncEngine";

interface DataMigrationDialogProps {
  onChoose: (choice: MigrationChoice) => void;
  onCancel: () => void;
}

export function DataMigrationDialog({ onChoose, onCancel }: DataMigrationDialogProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal-sheet migration-dialog" role="dialog" aria-modal="true" aria-label="データの同期方法">
        <div className="modal-header">
          <h2>データの同期方法</h2>
        </div>
        <div className="modal-body">
          <p>
            この端末とクラウドの両方にデータがあります。どちらを優先するか選んでください。
          </p>
          <div className="migration-actions">
            <button type="button" className="button-secondary" onClick={() => onChoose("cloud")}>
              クラウドのデータを使う
            </button>
            <button type="button" className="button-secondary" onClick={() => onChoose("local")}>
              この端末のデータをアップロード
            </button>
            <button type="button" className="button-primary" onClick={() => onChoose("merge")}>
              両方をマージ (新しい更新を優先)
            </button>
            <button type="button" className="button-ghost" onClick={onCancel}>
              キャンセル (クラウド優先)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
