import { Component, linkedSignal, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface Color {
  id: number
  name: string
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  readonly colorOptions = signal<Color[]>([{
    id: 1,
    name: 'Red',
  }, {
    id: 2,
    name: 'Green',
  }, {
    id: 3,
    name: 'Blue',
  }]);

  favoriteColorId = linkedSignal<Color[], number | null>({
    source: this.colorOptions,
    computation: (source, previous: { source: Color[]; value: number | null }) => {
      // previous có shape { source, value } — đọc previous.value (check previous tồn tại trước)
      // Không dùng `previous?.value` làm truthy-check vì sẽ bỏ qua giá trị falsy hợp lệ như 0
      if (previous && previous.value !== null) {
        return source.some(color => color.id === previous.value) ? previous.value : null;
      }
      return null;
    }
  });

  ngOnInit(): void {
    console.log(this.colorOptions()); // initial array
    console.log(this.favoriteColorId()); // null

    this.onFavoriteColorChange(3);

    console.log(this.favoriteColorId()); // 3

    this.changeColorOptions()
    console.log(this.favoriteColorId()); // null
  }

  protected onFavoriteColorChange(colorId: number): void {
    this.favoriteColorId.set(colorId);
  }

  protected changeColorOptions(): void {
    this.colorOptions.set([
      {
        id: 1,
        name: 'Red',
      },
      {
        id: 4,
        name: 'Yellow',
      },
      {
        id: 5,
        name: 'Orange',
      }
    ])
  }
}
