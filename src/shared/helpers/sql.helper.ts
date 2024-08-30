import { Between, ILike } from 'typeorm';
import { IFindAllFilter } from '../interfaces/find-all-filter.interface';

export const handleFilter = (filter: IFindAllFilter | IFindAllFilter[]) => {
  if (!filter) {
    return {};
  }

  const filters = Array.isArray(filter) ? filter : [filter];

  const whereClause = {};

  for (const f of filters) {


      if (f.column == 'dataHora') {

        Object.assign(whereClause, {
          [f.column]: dataPeriodo(f.value.toString()),
        });
  
        continue;
      }

      if(!isNaN(+f.value)) {

        Object.assign(whereClause, {
          [f.column]: Number(f.value),
        });

        continue;

      }

      if (typeof f.value === 'string') {
        Object.assign(whereClause, {
          [f.column]: ILike(`%${f.value}%`),
        });

        continue;
      }

      Object.assign(whereClause, {
        [f.column]: f.value,
      });

  }

  return whereClause;
};

const dataPeriodo = (value: string | Date) => {

  const data = new Date(value);
  const dataHoraInicio = `${data.toISOString().split('T')[0]}T00:00:00.000Z`;
  const dataHoraFim = `${data.toISOString().split('T')[0]}T23:59:59.000Z`;

  return Between(dataHoraInicio, dataHoraFim);

};

