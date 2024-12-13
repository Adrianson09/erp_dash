import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const estadoMapping = {
  A: { text: "BORRADOR", color: "text-red-600" },
  E: { text: "APROBADA", color: "text-lime-600" },
  O: { text: "CANCELADA", color: "text-red-600" },
  P: { text: "POR APROBAR", color: "text-red-600" },
  I: { text: "BACKORDER", color: "text-lime-600" },
  R: { text: "RECIBIDA", color: "text-lime-600" },
  U: { text: "CERRADA", color: "text-orange-600" },
  N: { text: "NO APROBADA", color: "text-red-800" },
};

export const OrderDetails = () => {

  const { company, id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Cargar los detalles de la orden
  useEffect(() => {
    fetch(`http://localhost:3000/api/ordenes/${company}/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar los datos de la orden");
        return res.json();
      })
      .then((data) => setOrderDetails(data))
      .catch((err) => setError(err.message));
  }, [company, id]);

  // Cargar los detalles del conjunto
  useEffect(() => {
    fetch("http://localhost:3000/api/companias")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar los datos de la compañía");
        return res.json();
      })
      .then((data) => {
        const selectedCompany = data.find((comp) => comp.conjunto === company);
        setCompanyDetails(selectedCompany);
      })
      .catch((err) => setError(err.message));
  }, [company]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!orderDetails || !companyDetails) return <p>Cargando datos...</p>;

  const estadoInfo = estadoMapping[orderDetails.estado] || { text: "DESCONOCIDO", color: "text-gray-600" };

  const handlePrint = () => {
    const originalContent = document.body.innerHTML;
    const printContent = document.querySelector(".print-only").outerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
  };

  const nombreProyectoUnico = orderDetails.lineas.length > 0 
  ? orderDetails.lineas[0].NOMBRE_PROYECTO 
  : "Sin proyecto";

  const codigoProyectoUnico = orderDetails.lineas.length > 0 
  ? orderDetails.lineas[0].proyecto 
  : "Sin proyecto";

  return (
    <div className="bg-gray-50 min-h-screen p-8 font-sans">
      {/* Botones */}
      <div className="flex justify-between no-print">
        <button
          onClick={() => navigate(`/dashboard/ordenes/`)}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Regresar
        </button>
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Imprimir
        </button>
      </div>

      {/* Contenedor Principal */}
      <div className="print-only bg-white shadow-md p-8 mx-auto max-w-4xl">
        {/* Encabezado */}
            <img src="/logo.jpg" alt="Caribe Hospitality" className="h-40 mb-2 mx-auto" />
        <header className="flex justify-between items-center bg-gray-100 p-4 rounded-md mb-6">
          <div>
            <p className="text-sm font-bold">{companyDetails.nombre}</p>
            <p className="text-sm">Avenida Escazú</p>
            <p className="text-sm">Teléfono: {companyDetails.telefono}</p>
            <p className="text-sm">NIT: {companyDetails.nit}</p>
            <p className="text-sm">Correo Electrónico: {companyDetails.EMAIL_DOC_ELECTRONICO || 'facturacion@caribehospitality.com'}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">ORDEN DE COMPRA</p>
            <p className="text-2xl font-extrabold">{orderDetails.orden_compra}</p>
            <p className={`${estadoInfo.color} font-bold text-lg`}>{estadoInfo.text}</p>
              
                              
          </div>
        </header>

        {/* Información General */}
        <div className="border-t border-b border-gray-300 py-4 mb-6">
          <p>
            <strong>Fecha:</strong>{" "}
            {new Date(orderDetails.fecha).toLocaleDateString("es-CR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p>
            <strong>Proveedor:</strong> {orderDetails.proveedor} -{" "}
            {orderDetails.nombre_proveedor}
          </p>
          <p>
            <strong>Contacto:</strong> {orderDetails.contacto_proveedor} 
          </p>
          <p>
            <strong>Correo Electrónico:</strong> {orderDetails.e_mail} 
          </p>
          <p>
            <strong>Teléfono:</strong> {orderDetails.telefono_proveedor}
          </p>
          <p>
            <strong>Facturar a:</strong> {companyDetails.nombre}
          </p>
          <p>
            <strong>Moneda:</strong> {orderDetails.moneda} 
          </p>
          <p>
            <strong>Proyecto:</strong>  {nombreProyectoUnico}  {codigoProyectoUnico}
          </p>
          
          
        </div>

        {/* Tabla de Líneas */}
        <table className="w-full border-collapse border border-gray-300 text-sm mb-6">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="border border-gray-300 p-2">Cantidad</th>
              {/* <th className="border border-gray-300 p-2">Unidad</th> */}
              <th className="border border-gray-300 p-2">Descripción</th>
              <th className="border border-gray-300 p-2">Número de Fase</th>
              {/* <th className="border border-gray-300 p-2">Proyecto</th> */}
              <th className="border border-gray-300 p-2">Precio Unitario</th>
              <th className="border border-gray-300 p-2">Descuento</th>
              <th className="border border-gray-300 p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.lineas.map((line) => (
              <tr key={line.orden_compra_linea}>
                <td className="border border-gray-300 p-2 text-center">
                  {line.cantidad_ordenada}
                </td>
                {/* <td className="border border-gray-300 p-2 text-center">SER</td> */}
                <td className="border border-gray-300 p-2">{line.descripcion_articulo}</td>
                <td className="border border-gray-300 p-2 text-center">{line.fase}</td>
                {/* <td className="border border-gray-300 p-2 text-center">{line.proyecto}</td> */}
                <td className="border border-gray-300 p-2 text-right">
                  {line.precio_unitario.toLocaleString("en-US")}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {line.descuento_linea.toLocaleString("en-US")}
                </td>
                <td className="border border-gray-300 p-2 text-right">
                  {(line.cantidad_ordenada * line.precio_unitario).toLocaleString("en-US")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="text-right mb-6">
          <p className="text-lg">
            <strong>Total Mercadería: </strong>  
            {orderDetails.total_mercaderia.toLocaleString("en-US")}
          </p>
          <p className="text-lg">
            <strong>Impuestos: </strong> {orderDetails.total_impuesto1.toLocaleString("en-US")}
          </p>
          <p className="text-lg">
            <strong>Descuento: </strong> {orderDetails.descuento_total.toLocaleString("en-US")}
          </p>
          <p className="text-lg font-bold">
            <strong>Total: </strong> 
            {(
              orderDetails.total_mercaderia + orderDetails.total_impuesto1
            ).toLocaleString("en-US")}
          </p>
        </div>


{/* Condiciones */}
<section classname="bg-gray-100 text-sm font-sans">
  <div classname="max-w-4xl text-sm mx-auto p-8 bg-white shadow-md">
    <h1 classname="text-sm font-bold mb-6"><strong>Cláusulas para Subcontratación</strong></h1>

    <h2 classname="text-sm font-semibold mt-4 mb-2"><strong>A. Definiciones</strong></h2>
    <p className="text-sm"><strong>CONTRATO:</strong> Formado por la ORDEN DE COMPRA, OFERTA FINAL, el presente documento “CLAUSULAS PARA SUBCONTRATACIÓN” y sus respectivos ANEXOS.</p>
    <p className="text-sm"><strong>CONTRATANTE:</strong> La empresa que figura en el encabezado de la ORDEN DE COMPRA.</p>
    <p className="text-sm"><strong>CONTRATISTA o PROVEEDOR:</strong> La persona física o jurídica que figura como “Proveedor” en la ORDEN DE COMPRA.</p>
    <p className="text-sm"><strong>TRABAJO:</strong> Conjunto de actividades o servicios que el CONTRATISTA se compromete a realizar en cumplimiento de las obligaciones establecidas en el CONTRATO.</p>
    <p className="text-sm"><strong>PRODUCTO:</strong> Bienes materiales que el PROVEEDOR se compromete a entregar en un tiempo determinado, bajo estándares de calidad establecidos, según ORDEN DE COMPRA.</p>
    <p className="text-sm"><strong>OBRA:</strong> Se refiere al sitio físico en el que se debe realizar el TRABAJO objeto de este contrato.</p>
    <p className="text-sm"><strong>COLABORADORES:</strong> Hace referencia a los empleados, dependientes u otros, que el CONTRATISTA requiera para realizar el TRABAJO objeto de este contrato.</p>

    <h2 classname="text-sm font-semibold mt-4 mb-2">B. Cláusulas Proveedor de Servicios</h2>
    <ol classname="list-decimal pl-6">
      <li className="text-sm">EL CONTRATISTA expresa conocer el alcance de su TRABAJO, así como las condiciones de la obra, y en general toda la información necesaria en relación con las actividades a realizar. De igual forma, poseer los recursos, conocimientos técnicos y los COLABORADORES necesarios para la adecuada ejecución de los trabajos.</li>
      <li className="text-sm">El CONTRATISTA al aceptar el presente CONTRATO se compromete de forma ineludible a cumplir en todo momento con las disposiciones vigentes, del país donde se encuentre la obra, en materia laboral, de seguridad social y seguridad ocupacional. Así como cumplir con los requisitos de sostenibilidad con los que cuenta el CONTRATANTE, mismos que pueden encontrar en el ANEXO 1 “formulario cumplimiento de contratos”.</li>
      <li className="text-sm">La fecha de inicio, así como el plazo para la realización de los trabajos, será la estipulada en la ORDEN DE COMPRA o con cualquier otra fecha definida por escrito de mutuo acuerdo entre las partes y en consecuencia la de finalización de estos. Las penalidades para el CONTRATISTA asociadas a un incumplimiento en estas fechas serán de hasta $5000 diarios, según sea la afectación a la Operación del Hotel, hasta un tope de 10% del valor de contrato.</li>
      <li className="text-sm">El CONTRATANTE no tendrá ninguna relación obrero-patrón con el CONTRATISTA, ni con los COLABORADORES que este último necesite para realizar el TRABAJO objeto del presente contrato, por lo que se exime de toda responsabilidad al CONTRATANTE por este concepto. Siendo el CONTRATISTA el único responsable de las obligaciones patronales que se deriven de la contratación de sus COLABORADORES.</li>
      <li className="text-sm">El CONTRATISTA es el único responsable de velar porque sus COLABORADORES permanezcan cubiertos bajo una póliza de riesgos del trabajo a lo largo de la vigencia de este contrato, de esta forma liberándose al CONTRATANTE de toda responsabilidad por este concepto.</li>
      <li className="text-sm">El CONTRATISTA debe cumplir con todas las normas vigentes en temas de seguridad ocupacional, velando porque sus COLABORADORES cuenten con el equipo de seguridad necesario para desarrollar las actividades objeto del presente contrato, así como cumplir con las normas establecidas por el contratista general en caso de que lo hubiere. El CONTRATISTA deberá pagar al CONTRATANTE por concepto de multa un monto de 50 dólares americanos por cada evento de incumplimiento. Dicho evento se registrará a través del equipo de supervisión de obra que haya sido facultado por el CONTRATANTE.</li>
      <li className="text-sm">El CONTRATISTA está en la obligación de mantener limpio el sitio específico de trabajo donde se encuentre llevando a cabo sus tareas, de manera que la OBRA no se vea afectada por los residuos que este produzca. En caso de que incumpla, el CONTRATISTA deberá pagar por concepto de multa la suma de 50 dólares americanos por cada evento de incumplimiento. Dicho evento se registrará a través del equipo de supervisión de obra que haya sido facultado por el CONTRATANTE.</li>
      <li className="text-sm">El CONTRATISTA es responsable absoluto por cualquier daño que cause este o alguno de sus COLABORADORES, ya sea por dolo u omisión.</li>
      <li className="text-sm">El CONTRATANTE podrá pausar la obra al finalizar un nivel y comenzar el siguiente por un máximo de 30 días naturales, esto debido a altas ocupaciones del hotel.</li>
    </ol>

    <h2 classname="text-sm font-semibold mt-4 mb-2">C. Cláusulas Proveedor de Productos</h2>
    <ol classname="list-decimal pl-6">
      <li className="text-sm">Queda estrictamente prohibido para el PROVEEDOR utilizar o emplear en la fabricación y/o manufactura del PRODUCTO piezas, refacciones o elementos que lo integren, los cuales se encuentren en mal estado, usados, reconstruidos, restaurados, adaptados o modificados.</li>
      <li className="text-sm">El PROVEEDOR se compromete a cumplir con los plazos de entrega definidos en la ORDEN DE COMPRA o con cualquier otra fecha definida por escrito de mutuo acuerdo entre las partes, comprendiendo que el no acatamiento significará una multa correspondiente de hasta $5000 dólares americanos diarios, según la afectación a la Operación del Hotel, por cada día de atraso, hasta un tope del 10% del valor contratado.</li>
      <li className="text-sm">El PROVEEDOR se compromete a entregar el PRODUCTO, justo en el lugar de destino indicado en la ORDEN DE COMPRA.</li>
      <li className="text-sm">Las partes acuerdan que una vez recibido el PRODUCTO en el lugar de destino, se realizarán pruebas de aceptación o puesta en marcha para revisar el buen funcionamiento del PRODUCTO, sus componentes y su estado en general...</li>
      
    </ol>

    <h2 classname="text-sm font-semibold mt-4 mb-2">D. Fuerza Mayor</h2>
    <p className="text-sm">Si en algún momento dentro de la vigencia del presente Contrato, el cumplimiento del PROVEEDOR, ya sea total o parcial de sus obligaciones, se vea retrasado por razones de acciones gubernamentales, guerra...</p>

    <h2 classname="text-sm font-semibold mt-4 mb-2">E. Facturación</h2>
    <p>Para toda contratación, que dentro de su desarrollo conlleve pagos parciales asociados al avance de los TRABAJOS o entregas parciales de los PRODUCTOS, es requisito indispensable la presentación de una Tabla de Pagos contra la facturación...</p>

    <h2 classname="text-sm font-semibold mt-4 mb-2">Formulario de Cumplimiento de Contratos</h2>
    <p className="text-sm"><strong>CEERTIFICACIÓN DE CONTRATISTA/PROVEEDOR</strong></p>
    <ul classname="list-disc pl-6">
      <li className="text-sm">Todas las regulaciones locales tanto a nivel social como ambiental.</li>
      <li className="text-sm">Todo lo solicitado en el Plan de Gestión Ambiental (o similar según cada país) y en el Sistema de Gestión de Sostenibilidad de Caribe Hospitality...</li>
      <li className="text-sm">Póliza para trabajadores...</li>
    </ul>

    <h2 classname="text-sm font-semibold mt-4 mb-2">Acuerdo Entendimiento de Exoneraciones</h2>
    <p className="text-sm">Estimado proveedor,</p>
    <p className="text-sm">{companyDetails.nombre}, con cédula jurídica número {companyDetails.nit}, es la propietaria del proyecto hotelero denominado “{nombreProyectoUnico}”...</p>
    <ul classname="list-disc pl-6 mb-2">
      <li className="text-sm">No debe tener ninguna perforación.</li>
      <li className="text-sm">Se debe presentar la factura original.</li>
      <li className="text-sm">La factura y cantidades deben ser legibles.</li>
      <li className="text-sm">Máximo de 12 líneas por factura.</li>
      <li className="text-sm">Que tenga nombre del cliente ({companyDetails.nombre}).</li>
    </ul>

  </div>
</section>

{/* Condiciones */}

        {/* Firmas */}
     



<div>
  <p className="my-2">
    <strong>Aprobado por:</strong>
  </p>
  <div className="grid grid-cols-2 gap-6">
    {/* Renderizar aprobadores */}
    {orderDetails.aprobadores.map((aprobador, index) => {
      // Mapeo de usuarios a nombres completos
      const nombres = {
        JSUCRE: "Jesús Sucre",
        DCAMPOS: "Daniel Campos",
        JQUESADA: "Juan Pablo Quesada",
        BLOPEZ: "Bernabé López",
        JBADILLA: "Johanna Badilla",
      };

      return (
        <div
          key={aprobador.rowPointer}
          className="text-center align-middle justify-center my-auto border p-16 rounded shadow-md bg-gray-100"
        >
          {/* Mostrar nombre completo o el usuario si no está en el mapeo */}
          <p className="font-bold">{nombres[aprobador.usuario] || aprobador.usuario}</p>
          <p className="text-sm">
            <em>{aprobador.rowPointer}</em>
          </p>
        </div>
      );
    })}

    {/* Condición para Dirección General */}
    {orderDetails.departamento === "DG" ? (
      <>
        {/* Agregar firma para usuario DCAMPOS */}
        
      </>
    ) : (
      <>
        {/* Mostrar sello de no requiere firma de DG */}
        <div className="text-center align-middle my-auto border p-16 rounded shadow-md bg-gray-100">
          <p className="font-bold border-spacing-8 border-solid border-gray-900 border-2 text-gray-800">
            No requiere firma de Dirección General
          </p>
        </div>
      </>
    )}

    {/* Firma del proveedor */}
    <div className="text-center border rounded shadow-md bg-gray-100">
      <p className="pt-20">________________________</p>
      <p className="font-bold">Proveedor</p>
      <p className="text-sm text-gray-600">Firma</p>
    </div>
  </div>
</div>


{/*  */}

      </div>
    </div>
  );
};
