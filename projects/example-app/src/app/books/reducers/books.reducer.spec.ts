import { reducer } from '@example-app/books/reducers/books.reducer';
import * as fromBooks from '@example-app/books/reducers/books.reducer';
import { SearchSuccess } from '@example-app/books/actions/books-api.actions';
import { LoadBook } from '@example-app/books/actions/book.actions';
import { SelectBook } from '@example-app/books/actions/view-book-page.actions';
import { Book, generateMockBook } from '@example-app/books/models/book';
import { LoadBooksSuccess } from '@example-app/books/actions/collection-api.actions';

describe('BooksReducer', () => {
  const book1 = generateMockBook();
  const book2 = { ...book1, id: '222' };
  const book3 = { ...book1, id: '333' };
  const initialState: fromBooks.State = {
    ids: [book1.id, book2.id],
    entities: {
      [book1.id]: book1,
      [book2.id]: book2,
    },
    selectedBookId: null,
  };

  describe('undefined action', () => {
    it('should return the default state', () => {
      const result = reducer(undefined, {} as any);

      expect(result).toMatchSnapshot();
    });
  });

  describe('SEARCH_COMPLETE & LOAD_SUCCESS', () => {
    function noExistingBooks(
      action: any,
      booksInitialState: any,
      books: Book[]
    ) {
      const createAction = new action(books);

      const result = reducer(booksInitialState, createAction);

      expect(result).toMatchSnapshot();
    }

    function existingBooks(action: any, booksInitialState: any, books: Book[]) {
      // should not replace existing books
      const differentBook2 = { ...books[0], foo: 'bar' };
      const createAction = new action([books[1], differentBook2]);

      const expectedResult = {
        ids: [...booksInitialState.ids, books[1].id],
        entities: {
          ...booksInitialState.entities,
          [books[1].id]: books[1],
        },
        selectedBookId: null,
      };

      const result = reducer(booksInitialState, createAction);

      expect(result).toMatchSnapshot();
    }

    it('should add all books in the payload when none exist', () => {
      noExistingBooks(SearchSuccess, initialState, [book1, book2]);

      noExistingBooks(LoadBooksSuccess, initialState, [book1, book2]);
    });

    it('should add only new books when books already exist', () => {
      existingBooks(SearchSuccess, initialState, [book2, book3]);

      existingBooks(LoadBooksSuccess, initialState, [book2, book3]);
    });
  });

  describe('LOAD', () => {
    const expectedResult = {
      ids: [book1.id],
      entities: {
        [book1.id]: book1,
      },
      selectedBookId: null,
    };

    it('should add a single book, if the book does not exist', () => {
      const action = new LoadBook(book1);

      const result = reducer(fromBooks.initialState, action);

      expect(result).toMatchSnapshot();
    });

    it('should return the existing state if the book exists', () => {
      const action = new LoadBook(book1);

      const result = reducer(expectedResult, action);

      expect(result).toMatchSnapshot();
    });
  });

  describe('SELECT', () => {
    it('should set the selected book id on the state', () => {
      const action = new SelectBook(book1.id);

      const result = reducer(initialState, action);

      expect(result).toMatchSnapshot();
    });
  });

  describe('Selectors', () => {
    describe('getSelectedId', () => {
      it('should return the selected id', () => {
        const result = fromBooks.getSelectedId({
          ...initialState,
          selectedBookId: book1.id,
        });

        expect(result).toMatchSnapshot();
      });
    });
  });
});
